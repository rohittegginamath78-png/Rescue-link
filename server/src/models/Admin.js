import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      default: "admin",
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
