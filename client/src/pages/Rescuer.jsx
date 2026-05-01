import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LocationPrompt from "../components/rescuer/LocationPrompt";
import RescuerCard from "../components/rescuer/RescuerCard";
import RescuerMap from "../components/rescuer/RescuerMap";
import Pill from "../components/ui/Pill";
import { SPECIALTIES } from "../constants/animals";
import { useGeolocation } from "../hooks/useGeolocation";
import { useRescuers } from "../hooks/useRescuers";
import { fetchCitiesWithRescuers } from "../services/api";
import { formatAnimal } from "../utils/formatters";
import { RefreshCw } from "lucide-react";
const MIN_CITY_LENGTH = 2;

export default function Rescuer() {
  const [searchParams] = useSearchParams();
  const geolocation = useGeolocation();
  const hydratedLocationFromQuery = useRef(false);
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
  const displayCity = rescuers.matchedCity || currentCity;
  const isLoadingCoverage =
    geolocation.loading ||
    rescuers.loading ||
    Boolean(
      geolocation.location &&
      !rescuers.matchedCity &&
      rescuers.rescuers.length === 0,
    );
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
    if (hydratedLocationFromQuery.current) return;

    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      hydratedLocationFromQuery.current = true;
      void geolocation.useLocation({ lat, lng });
      return;
    }

    const city = searchParams.get("city");
    if (city && city.trim().length >= MIN_CITY_LENGTH) {
      hydratedLocationFromQuery.current = true;
      geolocation.setManualCity(city);
      return;
    }

    if (
      searchParams.get("location") === "denied" ||
      searchParams.get("location") === "approximate"
    ) {
      setShowManualCityInput(true);
    }

    hydratedLocationFromQuery.current = true;
  }, [geolocation, searchParams]);

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

  if (!currentCity && !geolocation.location && !showManualCityInput) {
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
                placeholder="e.g., Bangalore, Mysore, Mangalore"
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
        <div className="mt-4 flex items-center gap-2">
          <Pill tone="green" onClick={() => setShowManualCityInput(true)}>
            {isLoadingCoverage ? "Locating..." : formatAnimal(displayCity)}
          </Pill>
          {geolocation.location && (
            <button
              type="button"
              onClick={handleLocationRequest}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <RefreshCw size={14} />
              Refresh location
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowManualCityInput(true)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Enter city manually
          </button>
        </div>
        {geolocation.location?.accuracy && (
          <p className="mt-2 text-xs text-gray-500">
            Location accuracy: about {Math.round(geolocation.location.accuracy)}{" "}
            m.
          </p>
        )}
        {geolocation.error && (
          <p className="mt-3 text-sm text-amber-700">{geolocation.error}</p>
        )}
      </div>

      {rescuers.error && !isLoadingCoverage && (
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

      {isLoadingCoverage ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-10 text-center">
          <p className="font-medium text-gray-900">
            Finding rescuers near you...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Checking your location and loading the nearest verified coverage.
          </p>
        </div>
      ) : rescuers.rescuers.length > 0 && geolocation.location ? (
        <div className="mb-8">
          <RescuerMap
            rescuers={rescuers.rescuers}
            userLat={geolocation.location.lat}
            userLng={geolocation.location.lng}
          />
        </div>
      ) : null}

      {!isLoadingCoverage && (
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
                tone={
                  rescuers.selectedSpecialty === specialty ? "green" : "gray"
                }
                onClick={() => rescuers.filterBySpecialty(specialty)}
              >
                {specialty}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {isLoadingCoverage ? null : rescuers.loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">Loading rescuers...</p>
        </div>
      ) : rescuers.rescuers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rescuers.rescuers.map((rescuer, index) => (
            <RescuerCard key={rescuer._id || index} rescuer={rescuer} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">
            No rescuers found in {displayCity || "your area"}.
          </p>
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
