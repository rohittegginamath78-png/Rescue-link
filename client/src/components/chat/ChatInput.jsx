import { useState } from 'react'

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your question...',
}) {
  const [input, setInput] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="btn-primary min-w-[88px] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? 'Sending...' : 'Send'}
      </button>
    </form>
  )
}
