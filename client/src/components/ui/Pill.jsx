export default function Pill({
  children,
  onClick,
  active = false,
  tone = 'gray',
  className = '',
  type = 'button',
}) {
  const styles = {
    gray: active
      ? 'border-gray-900 bg-gray-900 text-white'
      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    green: active
      ? 'border-green-600 bg-green-600 text-green-50'
      : 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100',
    amber: active
      ? 'border-amber-500 bg-amber-500 text-white'
      : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${styles[tone]} ${className}`}
    >
      {children}
    </button>
  )
}
