import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCitiesWithRescuers } from "../services/api";
import { formatAnimal, normalizeCity } from "../utils/formatters";

const MIN_CITY_LENGTH = 2;

export default function ManualCityRescuer() {
  const navigate = useNavigate();
  const [manualCity, setManualCity] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [manualCityError, setManualCityError] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [cityOptionsError, setCityOptionsError] = useState(null);

  const citySuggestions = useMemo(() => {
    const query = manualCity.trim().toLowerCase();

    return cityOptions
      .filter(
        ({ city }) =>
          !query ||
          city.includes(query) ||
          formatAnimal(city).toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [cityOptions, manualCity]);

  useEffect(() => {
    let ignore = false;

    async function loadCityOptions() {
      try {
        const cities = await fetchCitiesWithRescuers();
        if (!ignore) {
          setCityOptions(cities);
          setCityOptionsError(null);
        }
      } catch {
        if (!ignore) {
          setCityOptions([]);
          setCityOptionsError("City suggestions are unavailable right now.");
        }
      }
    }

    void loadCityOptions();

    return () => {
      ignore = true;
    };
  }, []);

  const submitManualCity = (cityName) => {
    const submittedCity = cityName.trim();
    if (submittedCity.length < MIN_CITY_LENGTH) {
      setManualCityError("Enter at least 2 letters, then choose a city.");
      setShowCitySuggestions(true);
      return;
    }

    const city = normalizeCity(submittedCity);
    navigate(`/rescuer?city=${encodeURIComponent(city)}`);
  };

  const handleManualCity = (event) => {
    event.preventDefault();
    submitManualCity(manualCity);
  };

  return (
    <div className="mx-auto mt-10 max-w-md px-4">
      <div className="card">
        <h1 className="mb-2 text-2xl font-medium text-gray-900">
          Enter your city
        </h1>
        <p className="mb-5 text-sm text-gray-600">
          Use manual search if browser location is denied or inaccurate.
        </p>

        <form onSubmit={handleManualCity} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={manualCity}
              onChange={(event) => {
                setManualCity(event.target.value);
                setManualCityError(null);
                setShowCitySuggestions(true);
              }}
              onFocus={() => setShowCitySuggestions(true)}
              onBlur={() => {
                window.setTimeout(() => setShowCitySuggestions(false), 120);
              }}
              autoComplete="off"
              placeholder="e.g., Hubli, Dharwad, Belgaum"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {showCitySuggestions && citySuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                {citySuggestions.map(({ city, count }) => (
                  <button
                    key={city}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      submitManualCity(city);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-green-50 focus:bg-green-50 focus:outline-none"
                  >
                    <span>{formatAnimal(city)}</span>
                    {typeof count === "number" && (
                      <span className="text-xs text-gray-500">
                        {count} rescuers
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {manualCityError && <p className="text-xs text-red-700">{manualCityError}</p>}
          {cityOptionsError && <p className="text-xs text-amber-700">{cityOptionsError}</p>}

          <button
            type="submit"
            disabled={manualCity.trim().length < MIN_CITY_LENGTH}
            className="w-full btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Find Rescuers
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/find-rescuer")}
          className="mt-2 w-full btn-secondary"
        >
          Back to options
        </button>
      </div>
    </div>
  );
}
