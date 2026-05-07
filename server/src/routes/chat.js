import { Hono } from "hono";
import { wildlifeSystemPrompt } from "../prompts/wildlifeSystemPrompt.js";

const router = new Hono();
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 7_000_000;
const ALLOWED_IMAGE_DATA_URL_PATTERN =
  /^data:image\/(?:jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const isDevelopment = process.env.NODE_ENV !== "production";

function logChatDebug(label, details = {}) {
  if (!isDevelopment) return;

  console.log(`[chat] ${label}`, details);
}

function getOpenRouterErrorMessage(error) {
  const message = error?.error?.message || error?.message;

  if (error?.status === 401 || error?.status === 403) {
    return "OpenRouter API key authentication failed. Check OPENROUTER_API_KEY in server/.env.";
  }

  if (error?.status === 402) {
    return "OpenRouter has no available credits for this key. Add credits or choose a free model in OPENROUTER_MODEL.";
  }

  if (error?.status === 429) {
    return "OpenRouter rate limit or quota reached. Check your OpenRouter usage limits.";
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return "AI response failed. Please try again.";
}

function getOpenRouterApiKey() {
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY;
  }

  if (process.env.OPENAI_API_KEY?.startsWith("sk-or-")) {
    return process.env.OPENAI_API_KEY;
  }

  return "";
}

function createTextStreamResponse(c, text) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "token", text })}\n\n`),
      );
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "done", fullResponse: text })}\n\n`,
        ),
      );
      controller.close();
    },
  });

  return c.newResponse(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function shouldUseLocalFallback(error, hasImage = false) {
  const message = error?.error?.message || error?.message || "";
  const normalizedMessage =
    typeof message === "string" ? message.toLowerCase() : "";

  return (
    hasImage ||
    error?.status === 503 ||
    normalizedMessage.includes("overloaded") ||
    normalizedMessage.includes("temporarily unavailable")
  );
}

function getLocalFallbackResponse({ animal, message, hasImage = false }) {
  const animalLabel =
    typeof animal === "string" && animal !== "other" ? animal : "animal";
  const lowerMessage = message.toLowerCase();
  const feedingAdvice =
    lowerMessage.includes("feed") || lowerMessage.includes("food")
      ? "Do not feed or force water. Many injured wild animals can choke, aspirate, or worsen if given the wrong food."
      : "Avoid food and water unless a licensed rescuer specifically tells you to give it.";

  const intro = hasImage
    ? `I cannot analyze the photo with the AI service right now, but here are safe first steps for this ${animalLabel}.`
    : `I cannot reach the AI service right now, but here are safe first steps for this ${animalLabel}.`;

  return [
    intro,
    hasImage
      ? "Do not rely on the photo alone for diagnosis. Treat visible bleeding, weakness, dragging limbs, breathing trouble, or attack wounds as urgent."
      : null,
    feedingAdvice,
    "Keep the animal in a quiet, dark, ventilated box lined with a soft cloth. Keep it warm, away from children, pets, noise, and direct handling.",
    "Do not try to treat wounds, remove stuck objects, bathe it, or give medicine.",
    "Contact a local wildlife rescuer or veterinarian as soon as possible, especially if there is bleeding, breathing trouble, weakness, or it was caught by a cat or dog.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function isValidImagePayload(image) {
  if (!image) return true;
  if (typeof image !== "object") return false;
  if (typeof image.dataUrl !== "string") return false;
  if (image.dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) return false;
  return ALLOWED_IMAGE_DATA_URL_PATTERN.test(image.dataUrl);
}

function buildUserContent(message, image) {
  if (!image?.dataUrl) return message;

  return [
    {
      type: "text",
      text: `${message}\n\nPlease inspect the attached animal photo. Describe only visible signs, avoid diagnosis certainty, and give safe first-aid steps.`,
    },
    {
      type: "image_url",
      image_url: {
        url: image.dataUrl,
      },
    },
  ];
}

function toOpenRouterMessages({
  systemPrompt,
  conversationHistory,
  message,
  image,
}) {
  const history = Array.isArray(conversationHistory)
    ? conversationHistory.slice(-10)
    : [];

  return [
    { role: "system", content: systemPrompt },
    ...history
      .filter(
        (entry) =>
          (entry.role === "user" || entry.role === "assistant") &&
          typeof entry.content === "string" &&
          entry.content.trim(),
      )
      .map((entry) => ({
        role: entry.role,
        content: entry.content,
      })),
    { role: "user", content: buildUserContent(message, image) },
  ];
}

async function createOpenRouterStream({ apiKey, messages, hasImage }) {
  const model = hasImage
    ? process.env.OPENROUTER_VISION_MODEL ||
      process.env.OPENROUTER_MODEL ||
      DEFAULT_OPENROUTER_MODEL
    : process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

  logChatDebug("openrouter request", {
    model,
    hasImage,
    messageCount: messages.length,
    lastUserMessageLength:
      typeof messages.at(-1)?.content === "string"
        ? messages.at(-1)?.content?.length || 0
        : messages.at(-1)?.content?.[0]?.text?.length || 0,
  });

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
      "X-Title": "RescueLink",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 700,
      stream: true,
    }),
  });

  logChatDebug("openrouter response", {
    status: response.status,
    generationId: response.headers.get("x-generation-id"),
  });

  if (!response.ok) {
    let errorBody = {};
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: response.statusText };
    }

    throw { status: response.status, ...errorBody };
  }

  if (!response.body) {
    throw new Error("OpenRouter did not return a response stream.");
  }

  return {
    stream: response.body,
    generationId: response.headers.get("x-generation-id"),
    model,
  };
}

function extractTextFromOpenRouterEvent(event) {
  return event?.choices?.[0]?.delta?.content || "";
}

async function pipeOpenRouterStreamToClient(openRouterResponse, controller, encoder) {
  const { stream: openRouterStream, generationId, model } = openRouterResponse;
  const reader = openRouterStream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";
  let usage = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const dataLines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6).trim());

      for (const data of dataLines) {
        if (!data || data === "[DONE]") continue;

        let event;
        try {
          event = JSON.parse(data);
        } catch (error) {
          logChatDebug("ignored non-json stream payload", {
            payloadPreview: data.slice(0, 80),
            error: error instanceof Error ? error.message : String(error),
          });
          continue;
        }

        if (event.usage) {
          usage = event.usage;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "usage", usage })}\n\n`,
            ),
          );
          continue;
        }

        const text = extractTextFromOpenRouterEvent(event);

        if (text) {
          fullResponse += text;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "token", text })}\n\n`,
            ),
          );
        }
      }
    }
  }

  logChatDebug("openrouter complete", {
    model,
    generationId,
    responseLength: fullResponse.length,
    usage,
  });

  controller.enqueue(
    encoder.encode(
      `data: ${JSON.stringify({ type: "done", fullResponse, usage, generationId })}\n\n`,
    ),
  );
}

router.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { message, animal, conversationHistory, image } = body;
    const hasImage = Boolean(image?.dataUrl);

    if ((!message || typeof message !== "string") && !hasImage) {
      return c.json({ error: "Message is required and must be a string" }, 400);
    }

    if (!isValidImagePayload(image)) {
      return c.json(
        { error: "Image must be a JPG, PNG, or WebP file up to 5MB." },
        400,
      );
    }

    const userMessage =
      typeof message === "string" && message.trim()
        ? message.trim()
        : "Please look at this animal photo and tell me what first-aid steps are safe.";

    const apiKey = getOpenRouterApiKey();
    if (!apiKey) {
      logChatDebug("missing openrouter key");
      const text = getLocalFallbackResponse({
        animal,
        message: userMessage,
        hasImage,
      });
      return createTextStreamResponse(c, text);
    }

    let systemPrompt = wildlifeSystemPrompt;
    if (animal && animal !== "other") {
      systemPrompt += `\n\nThe user is asking about a ${animal.toLowerCase()}.`;
    }
    if (hasImage) {
      systemPrompt +=
        "\n\nThe user attached an animal photo. Use the image only to describe visible signs. Do not diagnose with certainty. If the photo is unclear, say so and ask for details.";
    }

    const encoder = new TextEncoder();
    const messages = toOpenRouterMessages({
      systemPrompt,
      conversationHistory,
      message: userMessage,
      image,
    });
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const openRouterStream = await createOpenRouterStream({
            apiKey,
            messages,
            hasImage,
          });

          await pipeOpenRouterStreamToClient(
            openRouterStream,
            controller,
            encoder,
          );
        } catch (error) {
          logChatDebug("openrouter error", {
            status: error?.status,
            message: error?.error?.message || error?.message || String(error),
          });

          if (shouldUseLocalFallback(error, hasImage)) {
            const text = getLocalFallbackResponse({
              animal,
              message: userMessage,
              hasImage,
            });
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "token", text })}\n\n`,
              ),
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "done", fullResponse: text })}\n\n`,
              ),
            );
            return;
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: getOpenRouterErrorMessage(error) })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return c.newResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return c.json({ error: "Something went wrong, please try again" }, 500);
  }
});

export default router;
