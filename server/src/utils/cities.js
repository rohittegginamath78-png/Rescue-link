export const CITY_ALIASES = {
  bengaluru: 'bangalore',
  bangalore: 'bangalore',
  mysuru: 'mysore',
  mysore: 'mysore',
  mangaluru: 'mangalore',
  mangalore: 'mangalore',
  hubli: 'hubli-dharwad',
  hubballi: 'hubli-dharwad',
  dharwad: 'hubli-dharwad',
  'hubli-dharwad': 'hubli-dharwad',
  'hubballi-dharwad': 'hubli-dharwad',
  belagavi: 'belgaum',
  belgaum: 'belgaum',
}

export const CITY_COORDINATES = {
  bangalore: { lat: 12.9716, lng: 77.5946 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mangalore: { lat: 12.9141, lng: 74.856 },
  'hubli-dharwad': { lat: 15.3647, lng: 75.124 },
  belgaum: { lat: 15.8497, lng: 74.4977 },
}

export function normalizeCity(city) {
  if (!city) return ''
  const normalized = city.toLowerCase().trim()
  return CITY_ALIASES[normalized] || normalized
}

export function haversineDistanceKm(a, b) {
  const toRadians = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const term =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(term), Math.sqrt(1 - term)))
}

export function findNearestKnownCity(city) {
  const requested = CITY_COORDINATES[normalizeCity(city)]
  if (!requested) return []

  return findNearestKnownCityByCoordinates(requested.lat, requested.lng)
}

export function findNearestKnownCityByCoordinates(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return []
  const requested = { lat, lng }

  return Object.entries(CITY_COORDINATES)
    .map(([candidate, coords]) => ({
      city: candidate,
      distanceKm: haversineDistanceKm(requested, coords),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
