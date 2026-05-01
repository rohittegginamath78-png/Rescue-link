import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestCurrentPosition } from "../utils/rescuerNavigation";

export default function FindRescuerStart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const handleLocationAccess = async () => {
    setLoading(true);
    setLocationError(null);

    try {
      const position = await requestCurrentPosition();

      if ((position.coords.accuracy || Infinity) > 50000) {
        setLocationError(
          "Your browser returned an approximate location. Enter your city manually for accurate results.",
        );
        return;
      }

      const params = new URLSearchParams({
        lat: String(position.coords.latitude),
        lng: String(position.coords.longitude),
        source: "location",
      });

      navigate(`/rescuer?${params.toString()}`);
    } catch {
      setLocationError(
        "Location permission was denied or unavailable. You can enter your city manually instead.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-medium text-gray-900 md:text-4xl">
          Find a wildlife rescuer
        </h1>
        <p className="text-gray-600">
          Choose how you want RescueLink to find nearby verified coverage.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={handleLocationAccess}
          disabled={loading}
          className="rounded-xl border border-green-200 bg-green-50 p-6 text-left transition hover:border-green-400 hover:bg-green-100 disabled:cursor-wait disabled:opacity-70"
        >
          <p className="text-lg font-medium text-gray-900">Use my location</p>
          <p className="mt-2 text-sm text-gray-600">
            Ask for browser location permission and show the nearest verified
            rescuer coverage.
          </p>
          <span className="mt-5 inline-flex btn-primary">
            {loading ? "Getting location..." : "Allow location access"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/find-rescuer/manual")}
          className="rounded-xl border border-gray-200 bg-white p-6 text-left transition hover:border-green-300 hover:bg-gray-50"
        >
          <p className="text-lg font-medium text-gray-900">Enter city manually</p>
          <p className="mt-2 text-sm text-gray-600">
            Type your city or pick one of the verified coverage cities.
          </p>
          <span className="mt-5 inline-flex btn-secondary">Enter city</span>
        </button>
      </div>

      {locationError && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p>{locationError}</p>
          <button
            type="button"
            onClick={() => navigate("/find-rescuer/manual")}
            className="mt-3 btn-secondary text-xs"
          >
            Enter city manually
          </button>
        </div>
      )}
    </div>
  );
}
