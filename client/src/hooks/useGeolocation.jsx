import { useCallback, useState } from "react";
import {
  findNearestSupportedCity,
  getSupportedCityCoordinates,
  normalizeCity,
} from "../utils/formatters";

const GEOLOCATION_TIMEOUT_MS = 20000;
const REVERSE_GEOCODE_TIMEOUT_MS = 8000;
const FALLBACK_CITY_RADIUS_KM = 250;
const MAX_TRUSTED_ACCURACY_METERS = 25000;
const DEFAULT_CITY = "hubli-dharwad";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("prompt");

  const reverseGeocode = useCallback(async (lat, lng) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REVERSE_GEOCODE_TIMEOUT_MS,
    );

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        { signal: controller.signal },
      );
      const data = await response.json();
      const cityName =
        data.address?.city ||
        data.address?.town ||
        data.address?.municipality ||
        data.address?.suburb ||
        data.address?.village ||
        data.address?.county ||
        data.display_name;

      return normalizeCity(cityName);
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported");
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: GEOLOCATION_TIMEOUT_MS,
          maximumAge: 0,
          enableHighAccuracy: true,
        });
      });

      const { accuracy, latitude, longitude } = position.coords;

      if (
        typeof accuracy === "number" &&
        accuracy > MAX_TRUSTED_ACCURACY_METERS
      ) {
        const defaultLocation = getSupportedCityCoordinates(DEFAULT_CITY);
        setLocation(defaultLocation);
        setCity(DEFAULT_CITY);
               setPermission("granted");
        return {
          ...defaultLocation,
          city: DEFAULT_CITY,
        };
      }

      setLocation({ lat: latitude, lng: longitude });

      const geocodedCity = await reverseGeocode(latitude, longitude);
      const cityName =
        geocodedCity ||
        findNearestSupportedCity(latitude, longitude, FALLBACK_CITY_RADIUS_KM);

      if (!cityName || cityName === "unknown") {
        setCity(null);
        setError(
          "We found your coordinates, but could not match them to a supported city. Please enter your city manually.",
        );
        setPermission("granted");
        return null;
      }

      setCity(cityName);
      setPermission("granted");
      return { lat: latitude, lng: longitude, city: cityName };
    } catch (err) {
      if (err.code === 1) {
        setPermission("denied");
        setError(
          "Location permission denied. You can enter your city manually instead.",
        );
      } else if (err.code === 3) {
        setError("Location request timed out. Please try again.");
      } else {
        setError("Unable to get your location. Please try again.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [reverseGeocode]);

  const setManualCity = useCallback((cityName) => {
    const normalizedCity = normalizeCity(cityName);
    setCity(normalizedCity);
    setLocation(getSupportedCityCoordinates(normalizedCity));
  }, []);

  return {
    location,
    city,
    loading,
    error,
    permission,
    requestLocation,
    setManualCity,
  };
}
