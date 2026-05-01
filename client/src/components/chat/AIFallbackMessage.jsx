export default function AIFallbackMessage({ isAIFailed, onFindRescuerClick }) {
  const fallbackSteps = [
    "Do not feed or give water.",
    "Keep a safe distance and avoid unnecessary handling.",
    "If the animal appears injured and it is safe to help, place it in a ventilated box lined with a soft cloth.",
    "Keep the animal in a quiet, dark, and warm place.",
    "Do not attempt to treat injuries yourself.",
    "Please contact a wildlife rescuer as soon as possible.",
  ];

  return (
    <div className="flex justify-start">
      <div className="message-ai space-y-3 p-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-700">
          AI unavailable - connecting you to real help
        </p>
        <p>
          I'm unable to connect to the AI assistant right now. Please follow
          these immediate steps to keep the animal safe:
        </p>
        <ul className="space-y-2">
          {fallbackSteps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="text-gray-500">-</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
        {isAIFailed && (
          <button
            type="button"
            onClick={onFindRescuerClick}
            className="mt-3 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 animate-pulse"
          >
            Find rescuer near me
          </button>
        )}
      </div>
    </div>
  );
}
