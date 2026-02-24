const mongoose = require('mongoose');

let cached = null;

const connectDB = async () => {
  // Reuse existing connection (important for serverless)
  if (cached && mongoose.connection.readyState === 1) {
    return cached;
  }
  try {
    cached = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${cached.connection.host}`);
    return cached;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't process.exit in serverless — let the request fail gracefully
    throw error;
  }
};

module.exports = connectDB;
