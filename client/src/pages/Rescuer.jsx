import { useEffect, useMemo, useState } from "react";
import LocationPrompt from "../components/rescuer/LocationPrompt";
import RescuerCard from "../components/rescuer/RescuerCard";
import RescuerMap from "../components/rescuer/RescuerMap";
import Pill from "../components/ui/Pill";
import { SPECIALTIES } from "../constants/animals";
import { useGeolocation } from "../hooks/useGeolocation";
import { useRescuers } from "../hooks/useRescuers";
import { fetchCitiesWithRescuers } from "../services/api";
import {
  formatAnimal,
  formatSpecialty,
  MANUAL_CITY_OPTIONS,
  normalizeCity,
} from "../utils/formatters";

const MIN_CITY_LENGTH = 2;

export default function Rescuer() {
  const geolocation = useGeolocation();
  const [showManualCityInput, setShowManualCityInput] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [manualCityError, setManualCityError] = useState(null);
  const [cityOptions, setCityOptions] = useState([]);
  const [cityOptionsError, setCityOptionsError] = useState(null);

  const currentCity =
    geolocation.city && geolocation.city.length >= MIN_CITY_LENGTH
      ? geolocation.city
      : "";
  const rescuers = useRescuers(
    currentCity,
    geolocation.location?.lat,
    geolocation.location?.lng,
  );
  const resolvingLocation = geolocation.loading && !showManualCityInput;
  const citySuggestions = useMemo(() => {
    const query = manualCity.trim().toLowerCase();
    const mergedCities = new Map();

    for (const city of MANUAL_CITY_OPTIONS) {
      const normalized = normalizeCity(city);
      mergedCities.set(city, {
        city,
        normalized,
        count: cityOptions.find((option) => option.city === normalized)?.count,
      });
    }

    for (const option of cityOptions) {
      mergedCities.set(option.city, {
        ...option,
        normalized: normalizeCity(option.city),
      });
    }

    return [...mergedCities.values()]
      .filter(({ city, normalized }) => {
        const displayCity = formatAnimal(city).toLowerCase();
        const normalizedDisplay = formatAnimal(normalized).toLowerCase();
        return (
          !query ||
          city.includes(query) ||
          normalized.includes(query) ||
          displayCity.includes(query) ||
          normalizedDisplay.includes(query)
        );
      })
      .slice(0, 10);
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

  const handleLocationRequest = async () => {
    const result = await geolocation.requestLocation();
    if (result) {
      setShowManualCityInput(false);
      setManualCity("");
    }
  };

  const handleManualCity = (event) => {
    event.preventDefault();
    submitManualCity(manualCity);
  };

  const submitManualCity = (cityName) => {
    const submittedCity = cityName.trim();
    if (submittedCity.length < MIN_CITY_LENGTH) {
      setManualCityError(
        "Enter at least 2 letters, then choose a city or press Find Rescuers.",
      );
      setShowCitySuggestions(true);
      return;
    }

    setManualCityError(null);
    geolocation.setManualCity(submittedCity);
    setManualCity(submittedCity);
    setShowCitySuggestions(false);
    setShowManualCityInput(false);
  };

  if (resolvingLocation) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-xl border border-green-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
          <h1 className="text-2xl font-medium text-gray-900">
            Finding nearby rescuers
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Checking your current location and matching it to the nearest
            supported RescueLink city.
          </p>
        </div>
      </div>
    );
  }

  if (!currentCity && !showManualCityInput) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-medium text-gray-900 md:text-4xl">
            Rescuers near you
          </h1>
          <p className="text-lg text-gray-600">
            Find verified local wildlife rescuers instantly.
          </p>
        </div>
        <LocationPrompt
          onAllow={handleLocationRequest}
          onDeny={() => setShowManualCityInput(true)}
          loading={geolocation.loading}
        />
      </div>
    );
  }

  if (showManualCityInput) {
    return (
      <div className="mx-auto mt-8 max-w-md px-4">
        <div className="card">
          <h2 className="mb-4 text-xl font-medium text-gray-900">
            Enter your city
          </h2>
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
                placeholder="e.g., Hubli, Hubballi, Dharwad, Bangalore"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {citySuggestions.map(({ city, normalized, count }) => (
                    <button
                      key={`${city}-${normalized}`}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        submitManualCity(city);
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-green-50 focus:bg-green-50 focus:outline-none"
                    >
                      <span>{formatAnimal(city)}</span>
                      {typeof count === "number" ? (
                        <span className="text-xs text-gray-500">
                          {count} rescuers
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {formatAnimal(normalized)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {manualCityError && (
              <p className="text-xs text-red-700">{manualCityError}</p>
            )}
            {cityOptionsError && (
              <p className="text-xs text-amber-700">{cityOptionsError}</p>
            )}
            <button
              type="submit"
              disabled={manualCity.trim().length < MIN_CITY_LENGTH}
              className="w-full btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Find Rescuers
            </button>
          </form>
          <button
            onClick={() => {
              setShowManualCityInput(false);
              if (!currentCity) setManualCity("");
            }}
            className="mt-2 w-full btn-secondary"
          >
            {currentCity ? "Cancel" : "Use location instead"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-medium text-gray-900 md:text-4xl">
          Rescuers near you
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <Pill tone="green" onClick={() => setShowManualCityInput(true)}>
            {formatAnimal(currentCity)}
          </Pill>
          <button
            type="button"
            onClick={() => setShowManualCityInput(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Change city
          </button>
          {geolocation.location && (
            <button
              type="button"
              onClick={handleLocationRequest}
              disabled={geolocation.loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className={`h-3.5 w-3.5 ${geolocation.loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          )}
        </div>
        {geolocation.error && (
          <p className="mt-3 text-sm text-amber-700">{geolocation.error}</p>
        )}
      </div>

      {rescuers.error && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <span>{rescuers.error}</span>
          <button
            type="button"
            onClick={rescuers.refetch}
            className="btn-secondary text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {rescuers.loading ? (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-green-100 border-t-green-700" />
          <p className="text-sm text-gray-500">
            Loading verified rescuers for {formatAnimal(currentCity)}...
          </p>
        </div>
      ) : null}

      {!rescuers.loading && rescuers.rescuers.length > 0 && geolocation.location && (
        <div className="mb-8">
          <RescuerMap
            rescuers={rescuers.rescuers}
            userLat={geolocation.location.lat}
            userLng={geolocation.location.lng}
          />
        </div>
      )}

      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-gray-700">
          Filter by specialty
        </p>
        <div className="flex flex-wrap gap-2">
          <Pill
            tone={!rescuers.selectedSpecialty ? "green" : "gray"}
            onClick={rescuers.clearFilter}
          >
            All
          </Pill>
          {SPECIALTIES.map((specialty) => (
            <Pill
              key={specialty}
              tone={rescuers.selectedSpecialty === specialty ? "green" : "gray"}
              onClick={() => rescuers.filterBySpecialty(specialty)}
            >
              {formatSpecialty(specialty)}
            </Pill>
          ))}
        </div>
      </div>

      {!rescuers.loading && rescuers.rescuers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rescuers.rescuers.map((rescuer, index) => (
            <RescuerCard key={rescuer._id || index} rescuer={rescuer} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">No rescuers found in {currentCity}.</p>
          <button
            onClick={() => setShowManualCityInput(true)}
            className="mt-4 btn-secondary text-sm"
          >
            Try another city
          </button>
        </div>
      )}
    </div>
  );
}
