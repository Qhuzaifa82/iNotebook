const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // Load .env from current dir

console.log("🌍 Loaded MONGO_URI:", process.env.MONGO_URI); // Debug print

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // Use process.env
    console.log("✅ Connected to MongoDB Atlas successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

module.exports = connectToMongo;
