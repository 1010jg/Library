const { seedDatabase } = require("../config/seed");
const { Book, Member, Staff, Borrow, Fine, Policy } = require("../models");

// รีเซ็ตฐานข้อมูล MongoDB กลับเป็นค่าเริ่มต้น
async function resetSystem(req, res) {
  try {
    await seedDatabase(true);
    const [books, members, staff, borrows, fines, policy] = await Promise.all([
      Book.find().sort({ createdAt: 1 }).lean(),
      Member.find().sort({ createdAt: 1 }).lean(),
      Staff.find().sort({ createdAt: 1 }).lean(),
      Borrow.find().sort({ createdAt: 1 }).lean(),
      Fine.find().sort({ createdAt: 1 }).lean(),
      Policy.findOne().lean()
    ]);
    res.json({ books, members, staff, borrows, fines, policy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์
function healthCheck(req, res) {
  res.json({ status: "ok", db: "mongodb" });
}

module.exports = {
  resetSystem,
  healthCheck
};
