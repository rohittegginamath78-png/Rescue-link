export function formatAnimal(animalName) {
  if (!animalName) return "";
  return animalName
    .toLowerCase()
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function normalizeCity(city) {
  if (!city) return "";

  const aliases = {
    bengaluru: "bangalore",
    bangalore: "bangalore",
    mysuru: "mysore",
    mysore: "mysore",
    mangaluru: "mangalore",
    mangalore: "mangalore",
    hubli: "hubli-dharwad",
    hubballi: "hubli-dharwad",
    dharwad: "hubli-dharwad",
    hoskote: "hubli-dharwad",
    hoskate: "hubli-dharwad",
    hoskota: "hubli-dharwad",
    belgaum: "belgaum",
    belagavi: "belgaum",
  };

  return aliases[city.toLowerCase().trim()] || city.toLowerCase().trim();
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
