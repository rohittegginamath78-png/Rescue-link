export default function Badge({ children, tone = 'green' }) {
  const tones = {
    green: 'border border-green-200 bg-green-50 text-green-800',
    amber: 'border border-amber-200 bg-amber-50 text-amber-800',
    gray: 'border border-gray-200 bg-gray-100 text-gray-700',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}
