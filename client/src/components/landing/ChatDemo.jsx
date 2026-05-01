import { useNavigate } from 'react-router-dom'

export default function ChatDemo() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Main card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Chat demo</p>
              <h3 className="font-medium text-gray-900">Wildlife advisor</h3>
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
              Online
            </span>
          </div>
        </div>

        {/* Messages container */}
        <div className="h-80 space-y-3 overflow-y-auto p-4">
          <MessageBubble
            content="Hi! Tell me about the animal you found and what's happening - I'll guide you on exactly what to do."
            isUser={false}
          />
          
          <MessageBubble
            content="I found a baby squirrel on the road and it's cold and weak."
            isUser={true}
          />
          
          <MessageBubble
            isUser={false}
            steps={[
              { type: 'check', text: 'Place in a ventilated box with soft cloth' },
              { type: 'check', text: 'Keep warm, dark, and quiet' },
              { type: 'warning', text: 'Do NOT feed milk or water' },
              { type: 'check', text: 'Avoid handling if possible' },
              { type: 'check', text: 'Call a rescuer immediately' },
            ]}
          />
        </div>

        {/* Action button */}
        <div className="border-t border-gray-100 bg-white p-4">
          <button
            onClick={() => navigate('/rescuer')}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors duration-200 hover:bg-green-700"
          >
            <span>🚑</span>
            Find rescuer near me
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ content, isUser, steps }) {
  const containerClass = isUser ? 'flex justify-end' : 'flex justify-start'
  const bubbleClass = isUser
    ? 'max-w-[76%] rounded-lg rounded-tr-none border border-green-200 bg-green-50 p-3 text-sm text-green-900'
    : 'max-w-[85%] rounded-lg rounded-tl-none bg-gray-50 p-3 text-sm text-gray-700'

  return (
    <div className={containerClass}>
      <div className={bubbleClass}>
        {steps ? (
          <div className="space-y-2">
            <p className="font-medium text-gray-900">Immediate steps:</p>
            <div className="space-y-1.5 pt-2 border-t border-gray-200">
              {steps.map((step, idx) => (
                <Step key={idx} step={step} />
              ))}
            </div>
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  )
}

function Step({ step }) {
  const icon = step.type === 'check' ? '✓' : '⚠'
  const iconColor = step.type === 'check' ? 'text-green-600' : 'text-amber-600'

  return (
    <div className="flex gap-2 text-xs">
      <span className={`font-bold flex-shrink-0 ${iconColor}`}>{icon}</span>
      <span className="text-gray-700">{step.text}</span>
    </div>
  )
}
