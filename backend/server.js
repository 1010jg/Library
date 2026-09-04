require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/mongoose");
const { seedDatabase } = require("./config/seed");

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // 1. เชื่อมต่อ MongoDB
    await connectDB();

    // 2. นำเข้าข้อมูลเริ่มต้นสู่ MongoDB (หากยังไม่มีข้อมูล)
    await seedDatabase();

    // 3. เริ่มต้น Express Server
    app.listen(PORT, () => {
      console.log(`📚 Library backend API running at http://localhost:${PORT}`);
      console.log(`🍃 Connected to MongoDB and ready for MongoDB Compass!`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
