export default function DisclaimerBanner({ className = '' }) {
  return (
    <div className={`bg-amber-50 border-l-2 border-amber-400 px-3 py-2 text-xs text-amber-800 ${className}`}>
      AI guidance only - contact a wildlife professional for serious injuries.
    </div>
  )
}
