import { useCallback, useEffect, useState } from "react";
import { fetchRescuers } from "../services/api";
import { getDistanceFromLatLonInKm } from "../utils/formatters";

const FALLBACK_HELPLINES = [
  {
    name: "Wildlife SOS",
    phone: "+91-7259039944",
    whatsapp: "+91-7259039944",
    specialties: ["mammals"],
    available24hr: false,
    address: "Bannerghatta Biological Park, Bengaluru",
    lat: 12.8006,
    lng: 77.577,
    isFallback: true,
  },
  {
    name: "People For Animals Wildlife Hospital",
    phone: "+91-9900025370",
    whatsapp: "+91-9980339880",
    specialties: ["mammals", "birds", "reptiles"],
    available24hr: true,
    address: "Uttarahalli Main Road, Kengeri, Bengaluru",
    lat: 12.9043,
    lng: 77.4894,
    isFallback: true,
  },
];

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

        setRescuers(sorted.length > 0 ? sorted : FALLBACK_HELPLINES);
      } catch {
        setError(
          `Could not fetch verified rescuers for ${city}. Showing general emergency helplines instead.`,
        );
        setRescuers(FALLBACK_HELPLINES);
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
