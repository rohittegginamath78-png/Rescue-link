import mongoose from 'mongoose'

const RescuerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    specialties: {
      type: [String],
      enum: ['mammals', 'birds', 'reptiles', 'all'],
      default: ['all'],
    },
    available24hr: { type: Boolean, default: false },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, trim: true },
    verified: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
)

RescuerSchema.index({ city: 1, verified: 1 })
RescuerSchema.index({ lat: 1, lng: 1 })

export default mongoose.models.Rescuer || mongoose.model('Rescuer', RescuerSchema)
