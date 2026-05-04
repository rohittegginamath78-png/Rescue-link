export default function LocationPrompt({ onAllow, onDeny, loading = false }) {
  return (
    <div className="mx-auto mt-8 max-w-md">
      <div className="card bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          {loading ? (
            <div className="mb-4 flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="mb-4 text-4xl">+</div>
          )}
          <h2 className="mb-2 text-xl font-medium text-gray-900">Find Rescuers Near You</h2>
          <p className="mb-6 text-sm text-gray-600">
            Enable location access to find verified wildlife rescuers within your area.
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={onAllow} disabled={loading} className="btn-primary w-full">
              {loading ? 'Getting your location...' : 'Allow Location Access'}
            </button>
            <button onClick={onDeny} disabled={loading} className="btn-secondary w-full">
              Enter City Manually
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Your location is used only to find nearby rescuers. We do not store it.
          </p>
        </div>
      </div>
    </div>
  )
}
