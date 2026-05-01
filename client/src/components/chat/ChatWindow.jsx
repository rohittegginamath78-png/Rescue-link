import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import QuickReplies from "./QuickReplies";
import AIFallbackMessage from "./AIFallbackMessage";
import DisclaimerBanner from "../ui/DisclaimerBanner";

export default function ChatWindow({
  messages,
  loading,
  error,
  onSendMessage,
  onRetry,
  selectedAnimal,
  aiUnavailable,
  isAIFailed,
}) {
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFindRescuer = () => {
    navigate("/find-rescuer");
  };

  const handleQuickReply = (reply) => {
    if (reply.toLowerCase().includes("rescuer")) {
      void handleFindRescuer();
      return;
    }

    onSendMessage(reply, selectedAnimal);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 border-b border-gray-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-xs font-semibold text-white">
            RL
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Wildlife advisor</h3>
            <p
              className={`text-xs ${aiUnavailable ? "text-red-600" : "text-green-600"}`}
            >
              {aiUnavailable ? "Offline" : "Online"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index}>
            {message.isFallback ? (
              <AIFallbackMessage
                isAIFailed={isAIFailed}
                onFindRescuerClick={handleFindRescuer}
              />
            ) : (
              <>
                <MessageBubble
                  message={message}
                  isUser={message.role === "user"}
                />
                {message.role === "assistant" &&
                  index === messages.length - 1 && (
                    <QuickReplies
                      hidden={loading}
                      onSelect={handleQuickReply}
                    />
                  )}
              </>
            )}
          </div>
        ))}

        {error && !isAIFailed && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 font-medium text-red-800 underline"
              >
                Retry last message
              </button>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-3 border-t border-gray-100 bg-white p-4">
        <DisclaimerBanner />
        <ChatInput
          onSend={(text) => onSendMessage(text, selectedAnimal)}
          disabled={loading}
          placeholder="Tell me about the animal..."
        />
      </div>
    </div>
  );
}
