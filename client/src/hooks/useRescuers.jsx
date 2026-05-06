import { useCallback, useEffect, useState } from "react";
import { fetchRescuers } from "../services/api";
import { getDistanceFromLatLonInKm } from "../utils/formatters";

export function useRescuers(city, userLat, userLng) {
  const [rescuers, setRescuers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const fetchAndSort = useCallback(
    async (specialty = null) => {
      if (!city) {
        setRescuers([]);
        return;
      }

      setLoading(true);
      setError(null);
      setRescuers([]);

      try {
        const data = await fetchRescuers(city, specialty);
        const withDistance =
          typeof userLat === "number" && typeof userLng === "number"
            ? data.map((rescuer) => ({
                ...rescuer,
                distance: getDistanceFromLatLonInKm(
                  userLat,
                  userLng,
                  rescuer.lat,
                  rescuer.lng,
                ),
              }))
            : data;

        const sorted = [...withDistance].sort((a, b) => {
          if (a.available24hr !== b.available24hr) {
            return Number(b.available24hr) - Number(a.available24hr);
          }
          if (
            typeof a.distance === "number" &&
            typeof b.distance === "number"
          ) {
            return a.distance - b.distance;
          }
          return 0;
        });

        setRescuers(sorted);
      } catch {
        setError(
          `Could not fetch verified rescuers for ${city}. Please try again or enter your city manually.`,
        );
        setRescuers([]);
      } finally {
        setLoading(false);
      }
    },
    [city, userLat, userLng],
  );

  useEffect(() => {
    void fetchAndSort(selectedSpecialty);
  }, [fetchAndSort, selectedSpecialty]);

  return {
    rescuers,
    loading,
    error,
    selectedSpecialty,
    filterBySpecialty: setSelectedSpecialty,
    clearFilter: () => setSelectedSpecialty(null),
    refetch: () => fetchAndSort(selectedSpecialty),
  };
}
