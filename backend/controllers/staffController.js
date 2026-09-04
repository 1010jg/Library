const { Staff, Session } = require("../models");
const { formatDateThai, generateNextId } = require("../utils/helpers");

// ดึงรายชื่อบุคลากรทั้งหมดจาก MongoDB
async function getStaff(req, res) {
  try {
    const staff = await Staff.find().sort({ createdAt: 1 }).lean();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// เพิ่มบุคลากรใหม่ลง MongoDB (เฉพาะบทบาทบรรณารักษ์)
async function addStaff(req, res) {
  try {
    const { name, email, phone, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: "กรุณาระบุชื่อและอีเมล" });

    const cleanEmail = email.trim().toLowerCase();
    const exists = await Staff.findOne({ email: cleanEmail });
    if (exists) return res.status(400).json({ error: "อีเมลนี้มีอยู่ในระบบบุคลากรแล้ว กรุณาใช้อีเมลอื่น" });

    const newId = await generateNextId(Staff, "ST");
    const newStaff = await Staff.create({
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      role: role || "บรรณารักษ์",
      phone: phone ? phone.trim() : "-",
      registeredAt: formatDateThai(new Date())
    });

    res.status(201).json(newStaff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// แก้ไขข้อมูลบุคลากรใน MongoDB
async function updateStaff(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const staff = await Staff.findOne({ id });
    if (!staff) return res.status(404).json({ error: "ไม่พบบุคลากรนี้" });

    const cleanEmail = email ? email.trim().toLowerCase() : staff.email;

    // ตรวจสอบอีเมลซ้ำกับบุคลากรคนอื่น
    const emailDuplicate = await Staff.findOne({ id: { $ne: id }, email: cleanEmail });
    if (emailDuplicate) {
      return res.status(400).json({ error: "อีเมลนี้มีบุคลากรท่านอื่นใช้งานอยู่แล้ว" });
    }

    const oldEmail = staff.email.toLowerCase();

    staff.name = name ? name.trim() : staff.name;
    staff.email = cleanEmail;
    staff.phone = phone !== undefined ? (phone ? phone.trim() : "-") : staff.phone;
    if (role) {
      staff.role = role;
    }

    await staff.save();

    // หากแก้ไขข้อมูลของคนที่กำลังล็อกอินอยู่ ให้ sync session ด้วย
    const session = await Session.findOne({ key: "active_user" });
    if (session?.user && (session.user.email?.toLowerCase() === oldEmail || session.user.email?.toLowerCase() === cleanEmail)) {
      session.user.name = staff.name;
      session.user.email = staff.email;
      session.user.role = staff.role;
      await session.save();
    }

    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ลบบุคลากรออกจาก MongoDB
async function deleteStaff(req, res) {
  try {
    const { id } = req.params;
    const target = await Staff.findOne({ id });
    if (!target) return res.status(404).json({ error: "ไม่พบบุคลากรนี้" });

    // ป้องกันการลบบัญชีผู้ดูแลระบบ
    if (target.role === "ผู้ดูแลระบบ") {
      return res.status(400).json({ error: "ไม่สามารถลบบัญชีผู้ดูแลระบบหลักได้" });
    }

    await Staff.findOneAndDelete({ id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff
};
