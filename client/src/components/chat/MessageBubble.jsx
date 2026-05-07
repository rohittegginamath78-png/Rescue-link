export default function MessageBubble({ message, isUser = false }) {
  const bubbleClass = isUser ? "message-user" : "message-ai";
  const containerClass = isUser ? "flex justify-end" : "flex justify-start";

  return (
    <div className={containerClass}>
      <div className={`${bubbleClass} space-y-2 whitespace-pre-wrap p-3`}>
        {message.imagePreview && (
          <img
            src={message.imagePreview}
            alt={message.imageName || "Uploaded animal"}
            className="max-h-56 rounded-lg object-cover"
          />
        )}
        {message.content && <div>{message.content}</div>}
      </div>
    </div>
  );
}
