const { Fine } = require("../models");
const { formatDateThai, generateNextId } = require("../utils/helpers");

// ดึงรายการค่าปรับทั้งหมดจาก MongoDB
async function getFines(req, res) {
  try {
    const fines = await Fine.find().sort({ createdAt: 1 }).lean();
    res.json(fines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// สร้างรายการค่าปรับใหม่ลง MongoDB
async function createFine(req, res) {
  try {
    const { memberName, reason, amount } = req.body;
    if (!memberName) return res.status(400).json({ error: "กรุณาเลือกสมาชิก" });

    const newId = await generateNextId(Fine, "FN");
    const newFine = await Fine.create({
      id: newId,
      memberName,
      reason: reason || "ส่งคืนหนังสือเกินกำหนด",
      amount: Number(amount) || 10,
      date: formatDateThai(new Date()),
      status: "ค้างชำระ"
    });

    res.status(201).json(newFine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// บันทึกการรับชำระค่าปรับใน MongoDB
async function payFine(req, res) {
  try {
    const { id } = req.params;
    const fine = await Fine.findOne({ id });
    if (!fine) return res.status(404).json({ error: "ไม่พบรายการค่าปรับ" });

    fine.status = "ชำระแล้ว";
    await fine.save();

    res.json(fine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getFines,
  createFine,
  payFine
};
