const { Member } = require("../models");
const { generateNextId } = require("../utils/helpers");

// ดึงรายการสมาชิกทั้งหมดจาก MongoDB
async function getMembers(req, res) {
  try {
    const members = await Member.find().sort({ createdAt: 1 }).lean();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// เพิ่มสมาชิกใหม่ลง MongoDB
async function addMember(req, res) {
  try {
    const { name, phone, email, status } = req.body;
    if (!name) return res.status(400).json({ error: "กรุณาระบุชื่อสมาชิก" });

    const cleanEmail = email ? email.trim().toLowerCase() : "-";

    // ตรวจสอบอีเมลซ้ำในสมาชิก
    if (cleanEmail && cleanEmail !== "-") {
      const exists = await Member.findOne({ email: cleanEmail });
      if (exists) return res.status(400).json({ error: "อีเมลนี้มีสมาชิกท่านอื่นใช้งานอยู่แล้ว" });
    }

    const newId = await generateNextId(Member, "MB");
    const newMember = await Member.create({
      id: newId,
      name: name.trim(),
      phone: phone ? phone.trim() : "-",
      email: cleanEmail,
      status: status || "active"
    });

    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// แก้ไขข้อมูลสมาชิกใน MongoDB
async function updateMember(req, res) {
  try {
    const { id } = req.params;
    const { name, phone, email, status } = req.body;

    const member = await Member.findOne({ id });
    if (!member) return res.status(404).json({ error: "ไม่พบสมาชิก" });

    const cleanEmail = email !== undefined ? (email ? email.trim().toLowerCase() : "-") : member.email;

    // ตรวจสอบอีเมลซ้ำกับสมาชิกท่านอื่น
    if (cleanEmail && cleanEmail !== "-") {
      const exists = await Member.findOne({ id: { $ne: id }, email: cleanEmail });
      if (exists) return res.status(400).json({ error: "อีเมลนี้มีสมาชิกท่านอื่นใช้งานอยู่แล้ว" });
    }

    member.name = name ? name.trim() : member.name;
    member.phone = phone !== undefined ? (phone ? phone.trim() : "-") : member.phone;
    member.email = cleanEmail;
    member.status = status ?? member.status;

    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ลบสมาชิกออกจาก MongoDB
async function deleteMember(req, res) {
  try {
    const { id } = req.params;
    await Member.findOneAndDelete({ id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getMembers,
  addMember,
  updateMember,
  deleteMember
};
