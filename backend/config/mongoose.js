const mongoose = require("mongoose");

/**
 * เชื่อมต่อกับ MongoDB ผ่าน Mongoose โดยดึง URI จาก process.env.MONGODB_URI
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/library_db";
  try {
    const conn = await mongoose.connect(uri);
    console.log(`🍃 Connected to MongoDB via Mongoose: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`);
    console.warn(`   (ระบบยังสามารถทำงานต่อเนื่องได้)`);
    return null;
  }
}

module.exports = { connectDB };
