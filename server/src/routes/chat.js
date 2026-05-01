import { Hono } from "hono";
import { wildlifeSystemPrompt } from "../prompts/wildlifeSystemPrompt.js";

const router = new Hono();
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const FALLBACK_GEMINI_MODEL = "gemini-2.0-flash";

function getGeminiErrorMessage(error) {
  const message = error?.error?.message || error?.message;

  if (error?.status === 400 && typeof message === "string") {
    return message;
  }

  if (error?.status === 401 || error?.status === 403) {
    return "Gemini API key authentication failed. Check GEMINI_API_KEY in server/.env.";
  }

  if (error?.status === 429) {
    if (
      typeof message === "string" &&
      message.includes("limit: 0") &&
      message.includes("free_tier")
    ) {
      return "Gemini returned 0 available free-tier quota for this Google Cloud project. Check that the API key belongs to the intended AI Studio project, that Gemini API quota is enabled for the project, and that billing/free-tier access is active.";
    }

    return "Gemini rate limit or quota reached. Check your Google AI Studio usage limits.";
  }

  return message || "AI response failed. Please try again.";
}

function shouldUseLocalFallback(error) {
  return isTemporaryGeminiModelError(error);
}

function getLocalFallbackResponse({ animal, message }) {
  const animalLabel =
    typeof animal === "string" && animal !== "other" ? animal : "animal";
  const lowerMessage = message.toLowerCase();
  const feedingAdvice =
    lowerMessage.includes("feed") || lowerMessage.includes("food")
      ? "Do not feed or force water. Many injured wild animals can choke, aspirate, or worsen if given the wrong food."
      : "Avoid food and water unless a licensed rescuer specifically tells you to give it.";

  return [
    `I cannot reach the AI service right now, but here are safe first steps for this ${animalLabel}.`,
    feedingAdvice,
    "Keep the animal in a quiet, dark, ventilated box lined with a soft cloth. Keep it warm, away from children, pets, noise, and direct handling.",
    "Do not try to treat wounds, remove stuck objects, bathe it, or give medicine.",
    "Contact a local wildlife rescuer or veterinarian as soon as possible, especially if there is bleeding, breathing trouble, weakness, or it was caught by a cat or dog.",
  ].join("\n\n");
}

function toGeminiContents(conversationHistory, message) {
  const history = Array.isArray(conversationHistory)
    ? conversationHistory.slice(-10)
    : [];

  return [
    ...history
      .filter(
        (entry) =>
          (entry.role === "user" || entry.role === "assistant") &&
          typeof entry.content === "string" &&
          entry.content.trim(),
      )
      .map((entry) => ({
        role: entry.role === "assistant" ? "model" : "user",
        parts: [{ text: entry.content }],
      })),
    { role: "user", parts: [{ text: message }] },
  ];
}

async function createGeminiStream({ apiKey, systemPrompt, contents }) {
  const models = [
    process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    FALLBACK_GEMINI_MODEL,
  ].filter((model, index, allModels) => allModels.indexOf(model) === index);

  let lastError;

  for (const model of models) {
    try {
      return await createGeminiStreamForModel({
        apiKey,
        systemPrompt,
        contents,
        model,
      });
    } catch (error) {
      lastError = error;

      if (!isTemporaryGeminiModelError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function createGeminiStreamForModel({
  apiKey,
  systemPrompt,
  contents,
  model,
}) {
  const response = await fetch(
    `${GEMINI_API_BASE_URL}/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 700,
        },
      }),
    },
  );

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
    throw new Error("Gemini did not return a response stream.");
  }

  return response.body;
}

function isTemporaryGeminiModelError(error) {
  const message = error?.error?.message || error?.message || "";
  const normalizedMessage =
    typeof message === "string" ? message.toLowerCase() : "";

  return (
    error?.status === 503 ||
    normalizedMessage.includes("high demand") ||
    normalizedMessage.includes("overloaded") ||
    normalizedMessage.includes("temporarily unavailable")
  );
}

function extractTextFromGeminiEvent(event) {
  return (
    event?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || ""
  );
}

async function pipeGeminiStreamToClient(geminiStream, controller, encoder) {
  const reader = geminiStream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";

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
        if (!data) continue;

        const event = JSON.parse(data);
        const text = extractTextFromGeminiEvent(event);

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

  controller.enqueue(
    encoder.encode(
      `data: ${JSON.stringify({ type: "done", fullResponse })}\n\n`,
    ),
  );
}

router.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const { message, animal, conversationHistory } = body;

    if (!message || typeof message !== "string") {
      return c.json({ error: "Message is required and must be a string" }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json(
        { error: "Gemini API key is missing on the server" },
        500,
      );
    }

    let systemPrompt = wildlifeSystemPrompt;
    if (animal && animal !== "other") {
      systemPrompt += `\n\nThe user is asking about a ${animal.toLowerCase()}.`;
    }

    const encoder = new TextEncoder();
    const contents = toGeminiContents(conversationHistory, message);
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const geminiStream = await createGeminiStream({
            apiKey,
            systemPrompt,
            contents,
          });

          await pipeGeminiStreamToClient(geminiStream, controller, encoder);
        } catch (error) {
          if (shouldUseLocalFallback(error)) {
            const text = getLocalFallbackResponse({ animal, message });
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
              `data: ${JSON.stringify({ type: "error", error: getGeminiErrorMessage(error) })}\n\n`,
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
