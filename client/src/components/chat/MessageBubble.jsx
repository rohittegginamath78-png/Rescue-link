export default function MessageBubble({ message, isUser = false }) {
  const bubbleClass = isUser ? 'message-user' : 'message-ai'
  const containerClass = isUser ? 'flex justify-end' : 'flex justify-start'

  return (
    <div className={containerClass}>
      <div className={`${bubbleClass} whitespace-pre-wrap p-3`}>{message.content}</div>
    </div>
  )
}
