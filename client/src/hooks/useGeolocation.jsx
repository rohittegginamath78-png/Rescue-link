import { useCallback, useState } from "react";
import {
  findNearestSupportedCity,
  getSupportedCityCoordinates,
  normalizeCity,
} from "../utils/formatters";

const GEOLOCATION_TIMEOUT_MS = 5000;
const REVERSE_GEOCODE_TIMEOUT_MS = 2500;
const GEOLOCATION_CACHE_MS = 5 * 60 * 1000;
const FALLBACK_CITY_RADIUS_KM = 250;
const MAX_TRUSTED_ACCURACY_METERS = 25000;
const DEFAULT_CITY = "hubli-dharwad";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("prompt");

  const useDefaultCity = useCallback((message = null) => {
    const defaultLocation = getSupportedCityCoordinates(DEFAULT_CITY);
    setLocation(defaultLocation);
    setCity(DEFAULT_CITY);
    setError(message);
    setPermission("granted");
    return {
      ...defaultLocation,
      city: DEFAULT_CITY,
    };
  }, []);

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
          maximumAge: GEOLOCATION_CACHE_MS,
          enableHighAccuracy: false,
        });
      });

      const { accuracy, latitude, longitude } = position.coords;

      if (
        typeof accuracy === "number" &&
        accuracy > MAX_TRUSTED_ACCURACY_METERS
      ) {
        return useDefaultCity(
          "Your browser returned an approximate location, so RescueLink is showing Hubli-Dharwad. Use Change city if needed.",
        );
      }

      setLocation({ lat: latitude, lng: longitude });

      const nearestSupportedCity = findNearestSupportedCity(
        latitude,
        longitude,
        FALLBACK_CITY_RADIUS_KM,
      );
      if (nearestSupportedCity) {
        setCity(nearestSupportedCity);
        setPermission("granted");
        return { lat: latitude, lng: longitude, city: nearestSupportedCity };
      }

      const geocodedCity = await reverseGeocode(latitude, longitude);
      const cityName = geocodedCity;

      if (!cityName || cityName === "unknown") {
        return useDefaultCity(
          "We could not match your coordinates to a supported city, so RescueLink is showing Hubli-Dharwad. Use Change city if needed.",
        );
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
        return null;
      } else if (err.code === 3) {
        return useDefaultCity(
          "Location took too long, so RescueLink is showing Hubli-Dharwad. Use Change city if needed.",
        );
      }

      return useDefaultCity(
        "Unable to get your exact location, so RescueLink is showing Hubli-Dharwad. Use Change city if needed.",
      );
    } finally {
      setLoading(false);
    }
  }, [reverseGeocode, useDefaultCity]);

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
