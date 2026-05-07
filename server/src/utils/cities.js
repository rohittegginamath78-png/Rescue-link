export const CITY_ALIASES = {
  bengaluru: "bangalore",
  bangalore: "bangalore",
  "bangalore south": "bangalore",
  "bengaluru south": "bangalore",
  "bangalore urban": "bangalore",
  "bengaluru urban": "bangalore",
  mysuru: "mysore",
  mysore: "mysore",
  mangaluru: "mangalore",
  mangalore: "mangalore",
  hubli: "hubli-dharwad",
  hubballi: "hubli-dharwad",
  dharwad: "hubli-dharwad",
  "hubli dharwad": "hubli-dharwad",
  "hubli-dharwad": "hubli-dharwad",
  "hubballi dharwad": "hubli-dharwad",
  "hubballi-dharwad": "hubli-dharwad",
  "hubballi taluk": "hubli-dharwad",
  "hubli taluk": "hubli-dharwad",
  "dharwad district": "hubli-dharwad",
  belagavi: "belgaum",
  belgaum: "belgaum",
};

export const CITY_COORDINATES = {
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mangalore: { lat: 12.9141, lng: 74.856 },
  "hubli-dharwad": { lat: 15.3647, lng: 75.124 },
  bylakuppe: { lat: 12.45, lng: 76.15 },
  madikeri: { lat: 12.5133, lng: 75.7522 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
};

export function normalizeCity(city) {
  if (!city) return "";
  const normalized = city
    .toLowerCase()
    .trim()
    .replace(/[,_]+/g, " ")
    .replace(/\s+/g, " ");

  if (CITY_ALIASES[normalized]) return CITY_ALIASES[normalized];

  if (/\b(bengaluru|bangalore)\b/.test(normalized)) return "bangalore";
  if (/\b(mysuru|mysore)\b/.test(normalized)) return "mysore";
  if (/\b(mangaluru|mangalore)\b/.test(normalized)) return "mangalore";
  if (/\b(hubballi|hubli|dharwad)\b/.test(normalized)) {
    return "hubli-dharwad";
  }
  if (/\b(belagavi|belgaum)\b/.test(normalized)) return "belgaum";

  return normalized;
}

export function haversineDistanceKm(a, b) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const term =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(term), Math.sqrt(1 - term)));
}

export function findNearestKnownCity(city) {
  const requested = CITY_COORDINATES[normalizeCity(city)];
  if (!requested) return [];

  return Object.entries(CITY_COORDINATES)
    .map(([candidate, coords]) => ({
      city: candidate,
      distanceKm: haversineDistanceKm(requested, coords),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
