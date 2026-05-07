import { useCallback, useState } from "react";
import { streamChatMessage } from "../services/api";

const initialAssistantMessage = {
  role: "assistant",
  content:
    "Hi! Tell me about the animal you found and what's happening - I'll guide you on exactly what to do.",
};

const shouldLogChatDebug = import.meta.env.DEV;

function logChatDebug(label, details = {}) {
  if (!shouldLogChatDebug) return;

  console.log(`[chat] ${label}`, details);
}

export function useChat() {
  const [messages, setMessages] = useState([initialAssistantMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [isAIFailed, setIsAIFailed] = useState(false);

  const sendMessage = useCallback(
    async (userMessage, animal, image = null) => {
      const trimmed = userMessage.trim();
      if ((!trimmed && !image?.dataUrl) || loading) return;
      const messageText = trimmed || "Please look at this animal photo and tell me what first-aid steps are safe.";

      const historySnapshot = messages
        .filter((message) => message.content?.trim())
        .map((message) => ({ role: message.role, content: message.content }));

      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: messageText,
          imagePreview: image?.dataUrl || null,
          imageName: image?.name || null,
        },
        { role: "assistant", content: "", isFallback: false },
      ]);
      setLoading(true);
      setError(null);
      setAiUnavailable(false);
      setIsAIFailed(false);
      setLastPayload({ message: messageText, animal, image });

      try {
        let fullResponse = "";
        let hasReceivedToken = false;
        let usage = null;
        let generationId = null;

        for await (const event of streamChatMessage(
          messageText,
          animal,
          historySnapshot,
          image,
        )) {
          if (event.type === "token") {
            hasReceivedToken = true;
            fullResponse += event.text;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: fullResponse,
                isFallback: false,
              };
              return updated;
            });
          } else if (event.type === "usage") {
            usage = event.usage;
            logChatDebug("openrouter usage", { usage });
          } else if (event.type === "done") {
            usage = event.usage || usage;
            generationId = event.generationId || generationId;
          } else if (event.type === "error") {
            throw new Error(event.error || "Stream error");
          }
        }

        // Check if response is empty (no tokens received)
        if (!hasReceivedToken || !fullResponse.trim()) {
          throw new Error("Empty response from AI");
        }

        logChatDebug("assistant final response", {
          fullResponse,
          characters: fullResponse.length,
          usage,
          generationId,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "AI guidance is unavailable right now.";

        logChatDebug("ai failed", { error: errorMessage });
        setAiUnavailable(true);
        setIsAIFailed(true);
        setError(errorMessage);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;

          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              role: "assistant",
              content: null,
              isFallback: true,
            };
          } else {
            updated.push({
              role: "assistant",
              content: null,
              isFallback: true,
            });
          }
          return updated;
        });
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  const clearMessages = useCallback(() => {
    setMessages([initialAssistantMessage]);
    setError(null);
    setAiUnavailable(false);
    setIsAIFailed(false);
  }, []);

  const retryLastMessage = useCallback(() => {
    if (!lastPayload || loading) return;
    void sendMessage(lastPayload.message, lastPayload.animal, lastPayload.image);
  }, [lastPayload, loading, sendMessage]);

  return {
    messages,
    loading,
    error,
    aiUnavailable,
    isAIFailed,
    sendMessage,
    clearMessages,
    retryLastMessage,
  };
}
