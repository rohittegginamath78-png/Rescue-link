import mongoose from "mongoose";

const ModerationLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["verify", "reject", "disable", "enable", "delete", "add", "edit"],
      required: true,
      index: true,
    },
    rescuerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rescuer",
      index: true,
    },
    adminEmail: { type: String, required: true, trim: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

export default mongoose.models.ModerationLog ||
  mongoose.model("ModerationLog", ModerationLogSchema);
