export function formatAnimal(animalName) {
  if (!animalName) return "";
  return animalName
    .toLowerCase()
    .trim()
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatSpecialty(specialty) {
  const labels = {
    birds: "Bird rescue",
    mammals: "Wildlife rescue",
    reptiles: "Snake/Reptile rescue",
    "dog-cat": "Dog/Cat rescue",
    other: "Other rescue",
    all: "General rescue",
  };

  return labels[specialty] || formatAnimal(specialty);
}

export function normalizeCity(city) {
  if (!city) return "";

  const normalized = city
    .toLowerCase()
    .trim()
    .replace(/[,_]+/g, " ")
    .replace(/\s+/g, " ");

  const aliases = {
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
    belgaum: "belgaum",
    belagavi: "belgaum",
  };

  if (aliases[normalized]) return aliases[normalized];

  if (/\b(bengaluru|bangalore)\b/.test(normalized)) return "bangalore";
  if (/\b(mysuru|mysore)\b/.test(normalized)) return "mysore";
  if (/\b(mangaluru|mangalore)\b/.test(normalized)) return "mangalore";
  if (/\b(hubballi|hubli|dharwad)\b/.test(normalized)) {
    return "hubli-dharwad";
  }
  if (/\b(belagavi|belgaum)\b/.test(normalized)) return "belgaum";

  return normalized;
}

export const SUPPORTED_CITY_COORDINATES = {
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mangalore: { lat: 12.9141, lng: 74.856 },
  "hubli-dharwad": { lat: 15.3647, lng: 75.124 },
  bylakuppe: { lat: 12.45, lng: 76.15 },
  madikeri: { lat: 12.5133, lng: 75.7522 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
};

export const MANUAL_CITY_OPTIONS = [
  "bangalore",
  "hubli-dharwad",
  "hubli",
  "hubballi",
  "dharwad",
  "mysore",
  "mangalore",
  "belgaum",
  "belagavi",
  "bylakuppe",
  "madikeri",
];

export function getSupportedCityCoordinates(city) {
  return SUPPORTED_CITY_COORDINATES[normalizeCity(city)] || null;
}

export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function findNearestSupportedCity(lat, lng, maxDistanceKm = 80) {
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const nearest = Object.entries(SUPPORTED_CITY_COORDINATES)
    .filter(([city]) => city !== "karnataka")
    .map(([city, coords]) => ({
      city,
      distance: getDistanceFromLatLonInKm(lat, lng, coords.lat, coords.lng),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearest && nearest.distance <= maxDistanceKm ? nearest.city : null;
}

export function getGoogleMapsDirectionsUrl(rescuerLat, rescuerLng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${rescuerLat},${rescuerLng}`;
}

export function getWhatsAppLink(
  phone,
  message = "Hi, I need wildlife rescue help",
) {
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
