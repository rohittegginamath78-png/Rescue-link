import { Hono } from "hono";
import connectDB from "../config/db.js";
import Rescuer from "../models/Rescuer.js";
import {
  CITY_COORDINATES,
  findNearestKnownCity,
  findNearestKnownCityByCoordinates,
  haversineDistanceKm,
  normalizeCity,
} from "../utils/cities.js";

const router = new Hono();

function buildQuery(city, specialty) {
  const query = { city, verified: true };

  if (specialty) {
    query.specialties = { $in: [specialty, "all"] };
  }

  return query;
}

async function findFirstAvailableRescuers(rankedCities, specialty) {
  for (const candidate of rankedCities) {
    const rescuers = await Rescuer.find(buildQuery(candidate.city, specialty))
      .sort({ available24hr: -1, createdAt: -1 })
      .lean();

    if (rescuers.length > 0) {
      return { candidate, rescuers };
    }
  }

  return null;
}

router.get("/", async (c) => {
  try {
    await connectDB();

    const city = c.req.query("city");
    const specialty = c.req.query("specialty");
    const lat = Number(c.req.query("lat"));
    const lng = Number(c.req.query("lng"));
    const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

    if (!city && !hasCoordinates) {
      return c.json({ error: "City parameter is required" }, 400);
    }

    if (hasCoordinates) {
      const rankedCities = findNearestKnownCityByCoordinates(lat, lng);
      const match = await findFirstAvailableRescuers(rankedCities, specialty);

      if (match) {
        return c.json(
          match.rescuers.map((rescuer) => ({
            ...rescuer,
            requestedCity: city ? normalizeCity(city) : "current-location",
            matchedCity: match.candidate.city,
            cityDistanceKm: match.candidate.distanceKm,
          })),
        );
      }
    }

    const normalizedCity = normalizeCity(city);
    const localRescuers = await Rescuer.find(
      buildQuery(normalizedCity, specialty),
    )
      .sort({ available24hr: -1, createdAt: -1 })
      .lean();

    if (localRescuers.length > 0) {
      return c.json(
        localRescuers.map((rescuer) => ({
          ...rescuer,
          requestedCity: normalizedCity,
          matchedCity: normalizedCity,
        })),
      );
    }

    const rankedCities = findNearestKnownCity(normalizedCity).filter(
      (candidate) => candidate.city !== normalizedCity,
    );
    const fallbackMatch = await findFirstAvailableRescuers(
      rankedCities,
      specialty,
    );

    if (fallbackMatch) {
      return c.json(
        fallbackMatch.rescuers.map((rescuer) => ({
          ...rescuer,
          requestedCity: normalizedCity,
          matchedCity: fallbackMatch.candidate.city,
          cityDistanceKm:
            CITY_COORDINATES[normalizedCity] &&
            CITY_COORDINATES[fallbackMatch.candidate.city]
              ? haversineDistanceKm(
                  CITY_COORDINATES[normalizedCity],
                  CITY_COORDINATES[fallbackMatch.candidate.city],
                )
              : null,
        })),
      );
    }

    return c.json([]);
  } catch (error) {
    console.error("Failed to fetch rescuers", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

router.get("/cities", async (c) => {
  try {
    await connectDB();

    const cities = await Rescuer.aggregate([
      { $match: { verified: true } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { city: "$_id", count: 1, _id: 0 } },
    ]);

    return c.json(cities);
  } catch (error) {
    console.error("Failed to fetch rescuer cities", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

router.post("/", async (c) => {
  try {
    await connectDB();

    const body = await c.req.json();
    const { name, city, phone, whatsapp, specialties, lat, lng, address } =
      body;

    if (
      !name ||
      !city ||
      (!phone && !whatsapp) ||
      typeof lat !== "number" ||
      typeof lng !== "number"
    ) {
      return c.json(
        {
          error:
            "Missing required fields: name, city, phone or whatsapp, lat, lng",
        },
        400,
      );
    }

    const rescuer = await Rescuer.create({
      name: name.trim(),
      city: normalizeCity(city),
      phone: phone?.trim() || whatsapp.trim(),
      whatsapp: whatsapp?.trim(),
      specialties:
        Array.isArray(specialties) && specialties.length > 0
          ? specialties
          : ["all"],
      lat,
      lng,
      address: address?.trim(),
      verified: false,
    });

    return c.json(
      {
        message: "Rescuer submission received. Pending verification.",
        rescuerId: rescuer._id,
      },
      201,
    );
  } catch (error) {
    console.error("Failed to submit rescuer", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default router;
