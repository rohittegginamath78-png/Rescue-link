import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const DEMO_CONVERSATION = [
  {
    role: "assistant",
    content:
      "Hi! Tell me about the animal you found and what's happening - I'll guide you on exactly what to do.",
    delay: 0,
  },
  {
    role: "user",
    content: "I found a baby squirrel on the road and it's cold and weak.",
    delay: 1200,
  },
  {
    role: "assistant",
    content: "Immediate steps to keep the baby squirrel safe:",
    steps: [
      {
        type: "check",
        text: "Place it in a ventilated box lined with soft cloth",
      },
      { type: "check", text: "Keep the box in a warm, dark, quiet place" },
      { type: "warning", text: "Do NOT feed it milk or water" },
      { type: "check", text: "Avoid unnecessary handling and loud noises" },
      { type: "check", text: "Contact a wildlife rescuer immediately" },
    ],
    isFallback: false,
    delay: 2500,
  },
];

export default function ChatDemo() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const messagesEndRef = useRef(null);

  // Auto-play demo conversation
  useEffect(() => {
    const timers = [];

    DEMO_CONVERSATION.forEach((msg, index) => {
      const timer = setTimeout(() => {
        if (msg.steps) {
          // Show main content first
          setMessages((prev) => [...prev, { ...msg, displayedSteps: [] }]);
          setIsTyping(true);

          // Animate steps
          msg.steps.forEach((step, stepIndex) => {
            const stepTimer = setTimeout(() => {
              setMessages((prev) => {
                const updated = [...prev];
                if (updated[updated.length - 1]?.steps) {
                  updated[updated.length - 1].displayedSteps = msg.steps.slice(
                    0,
                    stepIndex + 1,
                  );
                }
                return updated;
              });
            }, stepIndex * 150);
            timers.push(stepTimer);
          });

          // Stop typing after all steps
          const endTypingTimer = setTimeout(
            () => {
              setIsTyping(false);
            },
            msg.steps.length * 150 + 300,
          );
          timers.push(endTypingTimer);
        } else {
          setMessages((prev) => [...prev, msg]);
        }
      }, msg.delay);

      timers.push(timer);
    });

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Background glow */}
      <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-gradient-to-r from-green-100 to-emerald-50 opacity-60 blur-2xl" />

      {/* Main card */}
      <div className="relative rounded-3xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Live AI demo
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">Wildlife advisor</h3>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              Online
            </span>
          </div>
        </div>

        {/* Messages container */}
        <div className="h-96 space-y-4 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isUser={message.role === "user"}
              isStepBased={!!message.steps}
              displayedSteps={message.displayedSteps}
            />
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3">
              <div className="flex gap-1">
                <span
                  className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-xs text-gray-500">AI is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action button - shown after demo completes */}
        {messages.length === DEMO_CONVERSATION.length && !isTyping && (
          <div className="border-t border-gray-100 bg-gradient-to-r from-white to-gray-50 p-4 animate-fade-in">
            <button
              onClick={() => navigate("/rescuer")}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-green-700 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <span>🚑</span>
              Find rescuer near me
            </button>
            <p className="mt-2 text-center text-xs text-gray-500">
              Get verified local rescuers in seconds
            </p>
          </div>
        )}

        {/* Quick replies - shown initially */}
        {messages.length <= 1 && (
          <div className="border-t border-gray-100 bg-gray-50 p-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-700">
              Show full steps
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-700">
              Can I feed it?
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message, isUser, isStepBased, displayedSteps = [] }) {
  const containerClass = isUser ? "flex justify-end" : "flex justify-start";
  const bubbleClass = isUser
    ? "max-w-[76%] rounded-2xl rounded-tr-sm border border-green-200 bg-green-50 p-3 text-sm text-green-900"
    : "max-w-[85%] rounded-2xl rounded-tl-sm bg-gray-50 p-3 text-sm leading-relaxed text-gray-700";

  return (
    <div className={`${containerClass} animate-message-slide`}>
      <div className={bubbleClass}>
        {isStepBased ? (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{message.content}</p>
            <div className="space-y-2 mt-3 pt-3 border-t border-gray-200">
              {displayedSteps.map((step, idx) => (
                <Step key={idx} step={step} />
              ))}
            </div>
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}

function Step({ step }) {
  const icon = step.type === "check" ? "✓" : "⚠";
  const iconColor = step.type === "check" ? "text-green-600" : "text-amber-600";
  const bgColor = step.type === "check" ? "bg-green-50" : "bg-amber-50";

  return (
    <div className={`flex gap-2 p-2 rounded-lg ${bgColor} animate-step-appear`}>
      <span className={`font-bold text-sm flex-shrink-0 ${iconColor}`}>
        {icon}
      </span>
      <span className="text-xs text-gray-700">{step.text}</span>
    </div>
  );
}
