
const mongoose = require("mongoose");

/**
 * เชื่อมต่อ MongoDB ผ่าน Mongoose
 * โดยดึง URI จาก process.env.MONGODB_URI
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // ตรวจสอบว่ามี MONGODB_URI หรือไม่
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      `🍃 Connected to MongoDB via Mongoose: ${conn.connection.host}`
    );

    return conn;

  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );

    // หยุดการเริ่มต้นระบบเมื่อเชื่อมต่อฐานข้อมูลไม่ได้
    throw error;
  }
}

module.exports = { connectDB };
