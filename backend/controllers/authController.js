const { Staff, Session } = require("../models");
const { formatDateThai, generateNextId } = require("../utils/helpers");
const { generateToken } = require("../middleware/authMiddleware");

// ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่ในปัจจุบันจาก MongoDB
async function getMe(req, res) {
  try {
    const session = await Session.findOne({ key: "active_user" }).lean();
    let user = session?.user || null;
    if (user && user.email) {
      const staffMember = await Staff.findOne({ email: user.email.toLowerCase() }).lean();
      if (staffMember) {
        user.role = staffMember.role;
        user.name = staffMember.name;
      }
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// เข้าสู่ระบบด้วยอีเมลบุคลากร
async function login(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "กรุณาระบุอีเมล" });

    const cleanEmail = email.trim().toLowerCase();
    let found = await Staff.findOne({ email: cleanEmail });

    // ถ้าพิมพ์ admin หรือ admin@library.com ให้เข้าสู่บัญชีผู้ดูแลระบบหลัก
    if (!found && (cleanEmail === "admin" || cleanEmail === "admin@library.com" || cleanEmail === "admin@gmail.com")) {
      found = await Staff.findOne({ role: "ผู้ดูแลระบบ" });
    }

    if (!found) {
      return res.status(404).json({ error: "ไม่พบบัญชีผู้ใช้นี้ในระบบบุคลากร กรุณาลงทะเบียนบรรณารักษ์ก่อน" });
    }

    const currentUser = {
      name: found.name,
      email: found.email,
      role: found.role,
      registeredAt: found.registeredAt
    };

    await Session.findOneAndUpdate(
      { key: "active_user" },
      { user: currentUser },
      { upsert: true, new: true }
    );

    const token = generateToken(currentUser);
    res.json({ user: currentUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ลงทะเบียนผู้ใช้ / บรรณารักษ์ใหม่ลง MongoDB
async function register(req, res) {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "กรุณาระบุชื่อและอีเมล" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "").slice(0, 10) : "-";

    const staffExists = await Staff.findOne({ email: cleanEmail });
    if (staffExists) {
      return res.status(400).json({ error: "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาไปที่แท็บ 'เข้าสู่ระบบ (ผู้ดูแลระบบ / เดิม)' เพื่อเข้าใช้งาน" });
    }

    const assignedRole = "บรรณารักษ์";
    const newId = await generateNextId(Staff, "ST");
    const newStaff = await Staff.create({
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      phone: cleanPhone || "-",
      registeredAt: formatDateThai(new Date())
    });

    const currentUser = {
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      registeredAt: new Date().toISOString()
    };

    await Session.findOneAndUpdate(
      { key: "active_user" },
      { user: currentUser },
      { upsert: true, new: true }
    );

    const token = generateToken(currentUser);
    res.json({ user: currentUser, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ออกจากระบบ
async function logout(req, res) {
  try {
    await Session.findOneAndUpdate({ key: "active_user" }, { user: null });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// แก้ไขข้อมูลโปรไฟล์ผู้ใช้งานใน MongoDB
async function updateProfile(req, res) {
  try {
    const { name, role } = req.body;
    const session = await Session.findOne({ key: "active_user" });
    if (!session?.user) return res.status(401).json({ error: "ยังไม่ได้เข้าสู่ระบบ" });

    session.user.name = name ? name.trim() : session.user.name;
    if (role) {
      session.user.role = role;
    }
    await session.save();

    // อัปเดตใน Staff ด้วย
    const updateFields = { name: session.user.name };
    if (role) {
      updateFields.role = role;
    }

    await Staff.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      updateFields
    );

    res.json({ user: session.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getMe,
  login,
  register,
  logout,
  updateProfile
};
