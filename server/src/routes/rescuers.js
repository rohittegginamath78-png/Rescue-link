import { Hono } from "hono";
import connectDB from "../config/db.js";
import { getAdminFromContext, verifyAdminToken } from "../middleware/auth.js";
import ModerationLog from "../models/ModerationLog.js";
import Rescuer from "../models/Rescuer.js";
import {
  CITY_COORDINATES,
  findNearestKnownCity,
  haversineDistanceKm,
  normalizeCity,
} from "../utils/cities.js";

const router = new Hono();

async function recordModerationAction(action, admin, rescuer, metadata = {}) {
  await ModerationLog.create({
    action,
    adminEmail: admin.email,
    rescuerId: rescuer?._id,
    metadata,
  });
}

function buildQuery(city, specialty) {
  const query = { city, verified: true, disabled: false, status: "approved" };

  if (specialty) {
    query.specialties = { $in: [specialty, "all"] };
  }

  return query;
}

function isValidPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

router.get("/", async (c) => {
  try {
    await connectDB();

    const city = c.req.query("city");
    const specialty = c.req.query("specialty");

    if (!city) {
      return c.json({ error: "City parameter is required" }, 400);
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

    const rankedCities = findNearestKnownCity(normalizedCity);
    for (const candidate of rankedCities) {
      if (candidate.city === normalizedCity) continue;

      const fallbackRescuers = await Rescuer.find(
        buildQuery(candidate.city, specialty),
      )
        .sort({ available24hr: -1, createdAt: -1 })
        .lean();

      if (fallbackRescuers.length > 0) {
        return c.json(
          fallbackRescuers.map((rescuer) => ({
            ...rescuer,
            requestedCity: normalizedCity,
            matchedCity: candidate.city,
            cityDistanceKm:
              CITY_COORDINATES[normalizedCity] &&
              CITY_COORDINATES[candidate.city]
                ? haversineDistanceKm(
                    CITY_COORDINATES[normalizedCity],
                    CITY_COORDINATES[candidate.city],
                  )
                : null,
          })),
        );
      }
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
      { $match: { verified: true, disabled: false, status: "approved" } },
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

router.get("/pending", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const rescuers = await Rescuer.find({ status: "pending" })
      .sort({ submittedAt: -1 })
      .lean();

    return c.json({ rescuers }, 200);
  } catch (error) {
    console.error("Failed to fetch pending rescuers", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

router.patch("/:id/verify", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const admin = getAdminFromContext(c);
    const rescuer = await Rescuer.findByIdAndUpdate(
      id,
      {
        verified: true,
        status: "approved",
        disabled: false,
        verifiedAt: new Date(),
        verifiedBy: admin.email,
        updatedBy: admin.email,
      },
      { new: true },
    );

    if (!rescuer) {
      return c.json({ error: "Rescuer not found" }, 404);
    }

    await recordModerationAction("verify", admin, rescuer);
    return c.json({ message: "Rescuer verified successfully", rescuer }, 200);
  } catch (error) {
    console.error("Failed to verify rescuer", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

router.patch("/:id/reject", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const admin = getAdminFromContext(c);
    const existingRescuer = await Rescuer.findById(id);

    if (!existingRescuer) {
      return c.json({ error: "Rescuer not found" }, 404);
    }

    const rescuer = await Rescuer.findByIdAndUpdate(
      id,
      {
        verified: false,
        status: "rejected",
        rejectedAt: new Date(),
        updatedBy: admin.email,
        notes: body.reason
          ? `${existingRescuer.notes || ""}\n[Rejection reason: ${body.reason}]`
          : existingRescuer.notes,
      },
      { new: true },
    );

    await recordModerationAction("reject", admin, rescuer, {
      reason: body.reason,
    });
    return c.json({ message: "Rescuer rejected successfully", rescuer }, 200);
  } catch (error) {
    console.error("Failed to reject rescuer", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

router.delete("/:id", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const admin = getAdminFromContext(c);
    const rescuer = await Rescuer.findByIdAndDelete(id);

    if (!rescuer) {
      return c.json({ error: "Rescuer not found" }, 404);
    }

    await recordModerationAction("delete", admin, rescuer, {
      name: rescuer.name,
      city: rescuer.city,
    });
    return c.json({ message: "Rescuer deleted successfully" }, 200);
  } catch (error) {
    console.error("Failed to delete rescuer", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

router.patch("/:id/disable", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const body = await c.req.json().catch(() => ({}));
    const disabled = body.disabled !== false;
    const admin = getAdminFromContext(c);
    const rescuer = await Rescuer.findByIdAndUpdate(
      id,
      {
        disabled,
        updatedBy: admin.email,
      },
      { new: true },
    );

    if (!rescuer) {
      return c.json({ error: "Rescuer not found" }, 404);
    }

    await recordModerationAction(disabled ? "disable" : "enable", admin, rescuer);
    return c.json(
      { message: disabled ? "Rescuer disabled" : "Rescuer enabled", rescuer },
      200,
    );
  } catch (error) {
    console.error("Failed to update rescuer disabled state", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// Community submission endpoint
router.post("/submit", async (c) => {
  try {
    await connectDB();

    const body = await c.req.json();
    const {
      name,
      city,
      phone,
      whatsapp,
      specialties,
      ngoName,
      instagram,
      notes,
      submitterEmail,
      submitterPhone,
      lat,
      lng,
      address,
    } = body;

    if (!name || !city || !phone) {
      return c.json(
        {
          error: "Missing required fields: name, city, phone",
        },
        400,
      );
    }

    if (!isValidPhone(phone)) {
      return c.json({ error: "A valid phone number is required" }, 400);
    }

    const normalizedCity = normalizeCity(city);
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedWhatsapp = whatsapp?.trim();

    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const possibleDuplicate = await Rescuer.findOne({
      $or: [
        { phone: trimmedPhone },
        ...(trimmedWhatsapp ? [{ whatsapp: trimmedWhatsapp }] : []),
        {
          city: normalizedCity,
          name: new RegExp(`^${escapedName}$`, "i"),
        },
      ],
    }).lean();

    // Default coordinates if not provided
    let rescuerLat = lat;
    let rescuerLng = lng;

    // Get coordinates from cities if available
    if (!lat || !lng) {
      const CITY_COORDINATES = {
        // Add your city coordinates here
        // Example: "bangalore": { lat: 12.9716, lng: 77.5946 }
      };
      if (CITY_COORDINATES[normalizedCity]) {
        rescuerLat = CITY_COORDINATES[normalizedCity].lat;
        rescuerLng = CITY_COORDINATES[normalizedCity].lng;
      } else {
        // Default coordinates (can be updated)
        rescuerLat = 0;
        rescuerLng = 0;
      }
    }

    const rescuer = await Rescuer.create({
      name: trimmedName,
      city: normalizedCity,
      phone: trimmedPhone,
      whatsapp: trimmedWhatsapp,
      specialties:
        Array.isArray(specialties) && specialties.length > 0
          ? specialties
          : ["all"],
      ngoName: ngoName?.trim(),
      instagram: instagram?.trim(),
      notes: notes?.trim(),
      submitterEmail: submitterEmail?.trim(),
      submitterPhone: submitterPhone?.trim(),
      lat: rescuerLat,
      lng: rescuerLng,
      address: address?.trim(),
      verified: false,
      status: "pending",
      addedBy: "community",
      disabled: false,
      submittedAt: new Date(),
      available24hr: false,
    });

    return c.json(
      {
        message:
          "Thank you for helping expand the wildlife rescue network. Your submission will be reviewed before becoming publicly visible.",
        warning: possibleDuplicate
          ? "Similar rescuer found. Please verify details before submitting."
          : undefined,
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
