import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatWindow from "../components/chat/ChatWindow";
import AnimalSelector from "../components/chat/AnimalSelector";
import {
  ANIMALS,
  ANIMAL_QUICK_PROMPTS,
  CONTEXT_CHIPS,
} from "../constants/animals";
import { useChat } from "../hooks/useChat";
import { formatAnimal } from "../utils/formatters";
import Pill from "../components/ui/Pill";

export default function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    messages,
    loading,
    error,
    aiUnavailable,
    isAIFailed,
    sendMessage,
    clearMessages,
    retryLastMessage,
  } = useChat();
  const [selectedAnimal, setSelectedAnimal] = useState("Other");
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    const queryAnimal = formatAnimal(searchParams.get("animal") || "Other");
    const match = ANIMALS.find(
      (animal) => animal.toLowerCase() === queryAnimal.toLowerCase(),
    );
    setSelectedAnimal(match || "Other");
  }, [searchParams]);

  const handleAnimalChange = (animal) => {
    setSelectedAnimal(animal);
    clearMessages();
    setSelectorOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-white md:flex-row">
      <aside className="border-b border-gray-100 bg-gray-50 p-4 md:w-[300px] md:border-b-0 md:border-r md:p-6">
        <div className="rounded-2xl border border-green-200 bg-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-green-700">
            Animal context
          </p>
          <h1 className="mt-3 text-3xl text-gray-900">{selectedAnimal}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Pick the closest animal type so the first-aid guidance stays
            specific and cautious.
          </p>
          <button
            type="button"
            onClick={() => setSelectorOpen((value) => !value)}
            className="mt-4 text-sm font-medium text-green-700"
          >
            Switch animal
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            Quick context
          </p>
          <div className="flex flex-wrap gap-2">
            {CONTEXT_CHIPS.map((chip) => (
              <Pill
                key={chip}
                tone="gray"
                onClick={() =>
                  sendMessage(
                    `${ANIMAL_QUICK_PROMPTS[selectedAnimal.toLowerCase()] || ANIMAL_QUICK_PROMPTS.other}. The animal seems ${chip}.`,
                    selectedAnimal,
                  )
                }
              >
                {chip}
              </Pill>
            ))}
          </div>
        </div>

        {selectorOpen && (
          <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
            <AnimalSelector
              selected={selectedAnimal}
              onSelect={handleAnimalChange}
            />
          </div>
        )}

        <div className="mt-6 space-y-2 rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-900">
            Need hands-on help?
          </p>
          <p className="text-sm text-gray-600">
            Switch to the rescuer finder if the animal has serious injuries,
            bleeding, or is dangerous to handle.
          </p>
          <Pill tone="green" onClick={() => navigate("/rescuer")}>
            Find rescuer instead
          </Pill>
        </div>
      </aside>

      <section className="min-h-0 flex-1">
        <ChatWindow
          messages={messages}
          loading={loading}
          error={error}
          aiUnavailable={aiUnavailable}
          isAIFailed={isAIFailed}
          onSendMessage={sendMessage}
          onRetry={retryLastMessage}
          selectedAnimal={selectedAnimal}
        />
      </section>
    </div>
  );
}
