import { useCallback, useState } from "react";
import { normalizeCity } from "../utils/formatters";
import { requestCurrentPosition } from "../utils/rescuerNavigation";

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState("prompt");

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();
      const cityName =
        data.address?.city ||
        data.address?.suburb ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "Unknown";

      return normalizeCity(cityName);
    } catch {
      return null;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await requestCurrentPosition();

      const { latitude, longitude } = position.coords;
      if ((position.coords.accuracy || Infinity) > 50000) {
        setError(
          "Your browser returned an approximate location. Enter your city manually for accurate rescuer results.",
        );
        return null;
      }

      setLocation({
        lat: latitude,
        lng: longitude,
        accuracy: position.coords.accuracy,
      });

      const cityName = await reverseGeocode(latitude, longitude);
      if (cityName) {
        setCity(cityName);
      }

      setPermission("granted");
      return {
        lat: latitude,
        lng: longitude,
        accuracy: position.coords.accuracy,
        city: cityName,
      };
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

  const useLocation = useCallback(
    async ({ lat, lng }) => {
      if (typeof lat !== "number" || typeof lng !== "number") {
        return null;
      }

      setLoading(true);
      setError(null);
      setLocation({ lat, lng });

      try {
        const cityName = await reverseGeocode(lat, lng);
        if (cityName) {
          setCity(cityName);
        }

        setPermission("granted");
        return { lat, lng, city: cityName };
      } catch {
        setError("Unable to identify your city from this location.");
        return { lat, lng, city: null };
      } finally {
        setLoading(false);
      }
    },
    [reverseGeocode],
  );

  const setManualCity = useCallback((cityName) => {
    setLocation(null);
    setCity(normalizeCity(cityName));
    setPermission("prompt");
    setError(null);
  }, []);

  return {
    location,
    city,
    loading,
    error,
    permission,
    requestLocation,
    useLocation,
    setManualCity,
  };
}
