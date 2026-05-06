import mongoose from "mongoose";

const RescuerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    specialties: {
      type: [String],
      enum: ["mammals", "birds", "reptiles", "dog-cat", "other", "all"],
      default: ["all"],
    },
    available24hr: { type: Boolean, default: false },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, trim: true },
    verified: { type: Boolean, default: false, index: true },

    // Community & Admin fields
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    addedBy: {
      type: String,
      enum: ["community", "admin"],
      default: "community",
    },
    disabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Community submission fields
    ngoName: { type: String, trim: true },
    instagram: { type: String, trim: true },
    notes: { type: String, trim: true },
    submitterEmail: { type: String, trim: true },
    submitterPhone: { type: String, trim: true },

    // Audit fields
    submittedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    rejectedAt: { type: Date },
    verifiedBy: { type: String, trim: true },
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true },
);

RescuerSchema.index({ city: 1, verified: 1 });
RescuerSchema.index({ lat: 1, lng: 1 });

export default mongoose.models.Rescuer ||
  mongoose.model("Rescuer", RescuerSchema);
