import mongoose from 'mongoose'

let cachedConnection = null

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rescuelink'
  cachedConnection = await mongoose.connect(mongoUri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  })

  return cachedConnection
}

export default connectDB
