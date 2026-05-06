import { Hono } from "hono";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";
import ModerationLog from "../models/ModerationLog.js";
import Rescuer from "../models/Rescuer.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { verifyAdminToken, getAdminFromContext } from "../middleware/auth.js";

const router = new Hono();

async function recordModerationAction(action, admin, rescuer, metadata = {}) {
  await ModerationLog.create({
    action,
    adminEmail: admin.email,
    rescuerId: rescuer?._id,
    metadata,
  });
}

// ==================== LOGIN ====================
router.post("/login", async (c) => {
  try {
    await connectDB();

    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Find admin
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });
    if (!admin) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id.toString(), admin.email);

    return c.json(
      {
        message: "Login successful",
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== DASHBOARD STATS ====================
router.get("/dashboard-stats", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const [
      totalVerified,
      totalPending,
      totalNGOs,
      snakeRescuers,
      birdRescuers,
    ] = await Promise.all([
      Rescuer.countDocuments({
        verified: true,
        disabled: false,
        status: "approved",
      }),
      Rescuer.countDocuments({ status: "pending" }),
      Rescuer.countDocuments({
        ngoName: { $exists: true, $ne: "" },
        verified: true,
        disabled: false,
      }),
      Rescuer.countDocuments({
        specialties: "reptiles",
        verified: true,
        disabled: false,
      }),
      Rescuer.countDocuments({
        specialties: "birds",
        verified: true,
        disabled: false,
      }),
    ]);

    return c.json(
      {
        totalVerified,
        totalPending,
        totalNGOs,
        snakeRescuers,
        birdRescuers,
      },
      200,
    );
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== PENDING RESCUERS ====================
router.get("/pending-rescuers", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;

    const [rescuers, total] = await Promise.all([
      Rescuer.find({ status: "pending" })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Rescuer.countDocuments({ status: "pending" }),
    ]);

    return c.json(
      {
        rescuers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Pending rescuers error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== VERIFIED RESCUERS ====================
router.get("/verified-rescuers", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const skip = (page - 1) * limit;
    const specialty = c.req.query("specialty");
    const city = c.req.query("city");

    const filter = { status: "approved", verified: true };
    if (specialty) filter.specialties = specialty;
    if (city) filter.city = city.toLowerCase();

    const [rescuers, total] = await Promise.all([
      Rescuer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Rescuer.countDocuments(filter),
    ]);

    return c.json(
      {
        rescuers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Verified rescuers error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== GET SINGLE RESCUER ====================
router.get("/rescuer/:id", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const rescuer = await Rescuer.findById(id).lean();

    if (!rescuer) {
      return c.json({ error: "Rescuer not found" }, 404);
    }

    return c.json(rescuer, 200);
  } catch (error) {
    console.error("Get rescuer error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== VERIFY RESCUER ====================
router.patch("/rescuer/:id/verify", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const admin = getAdminFromContext(c);

    const rescuer = await Rescuer.findByIdAndUpdate(
      id,
      {
        verified: true,
        status: "approved",
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

    return c.json(
      {
        message: "Rescuer verified successfully",
        rescuer,
      },
      200,
    );
  } catch (error) {
    console.error("Verify rescuer error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== REJECT RESCUER ====================
router.patch("/rescuer/:id/reject", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const { reason } = await c.req.json();
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
        notes: reason
          ? `${existingRescuer.notes || ""}\n[Rejection reason: ${reason}]`
          : existingRescuer.notes,
      },
      { new: true },
    );

    await recordModerationAction("reject", admin, rescuer, { reason });

    return c.json(
      {
        message: "Rescuer rejected successfully",
        rescuer,
      },
      200,
    );
  } catch (error) {
    console.error("Reject rescuer error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== DELETE RESCUER ====================
router.delete("/rescuer/:id", verifyAdminToken, async (c) => {
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

    return c.json(
      {
        message: "Rescuer deleted successfully",
      },
      200,
    );
  } catch (error) {
    console.error("Delete rescuer error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== DISABLE RESCUER (Soft Delete) ====================
router.patch("/rescuer/:id/disable", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const { disabled } = await c.req.json();
    const admin = getAdminFromContext(c);

    const rescuer = await Rescuer.findByIdAndUpdate(
      id,
      {
        disabled: disabled === true,
        updatedBy: admin.email,
      },
      { new: true },
    );

    if (!rescuer) {
      return c.json({ error: "Rescuer not found" }, 404);
    }

    await recordModerationAction(disabled ? "disable" : "enable", admin, rescuer);

    return c.json(
      {
        message: disabled ? "Rescuer disabled" : "Rescuer enabled",
        rescuer,
      },
      200,
    );
  } catch (error) {
    console.error("Disable rescuer error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== ADD RESCUER (Admin) ====================
router.post("/add-rescuer", verifyAdminToken, async (c) => {
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
      address,
      lat,
      lng,
    } = body;
    const admin = getAdminFromContext(c);

    // Validation
    if (!name || !city || !phone) {
      return c.json(
        {
          error: "Missing required fields: name, city, phone",
        },
        400,
      );
    }

    const rescuer = await Rescuer.create({
      name: name.trim(),
      city: city.toLowerCase().trim(),
      phone: phone.trim(),
      whatsapp: whatsapp?.trim(),
      specialties:
        Array.isArray(specialties) && specialties.length > 0
          ? specialties
          : ["all"],
      ngoName: ngoName?.trim(),
      instagram: instagram?.trim(),
      notes: notes?.trim(),
      address: address?.trim(),
      lat: lat || 0,
      lng: lng || 0,
      verified: true,
      status: "approved",
      addedBy: "admin",
      verifiedAt: new Date(),
      verifiedBy: admin.email,
      available24hr: false,
    });

    await recordModerationAction("add", admin, rescuer);

    return c.json(
      {
        message:
          "Rescuer added successfully. They are now visible in public search.",
        rescuer,
      },
      201,
    );
  } catch (error) {
    console.error("Add rescuer error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== EDIT RESCUER ====================
router.patch("/rescuer/:id", verifyAdminToken, async (c) => {
  try {
    await connectDB();

    const { id } = c.req.param();
    const body = await c.req.json();
    const admin = getAdminFromContext(c);

    // Allowed fields to update
    const allowedFields = [
      "name",
      "phone",
      "whatsapp",
      "specialties",
      "ngoName",
      "instagram",
      "notes",
      "address",
      "lat",
      "lng",
      "available24hr",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (field in body) {
        updateData[field] = body[field];
      }
    });

    updateData.updatedBy = admin.email;

    const rescuer = await Rescuer.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!rescuer) {
      return c.json({ error: "Rescuer not found" }, 404);
    }

    await recordModerationAction("edit", admin, rescuer, {
      fields: Object.keys(updateData).filter((field) => field !== "updatedBy"),
    });

    return c.json(
      {
        message: "Rescuer updated successfully",
        rescuer,
      },
      200,
    );
  } catch (error) {
    console.error("Edit rescuer error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

// ==================== VERIFY TOKEN ====================
router.post("/verify-token", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ valid: false }, 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return c.json({ valid: false }, 401);
    }

    return c.json({ valid: true, admin: decoded }, 200);
  } catch (error) {
    return c.json({ valid: false }, 401);
  }
});

export default router;
