const { Staff } = require("../models");
const { formatDateThai, generateNextId } = require("../utils/helpers");
const { generateToken } = require("../middleware/authMiddleware");

// ดึงข้อมูลผู้ใช้ที่ล็อกอินอยู่
async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "ยังไม่ได้เข้าสู่ระบบ"
      });
    }

    // ใช้ email จาก JWT เพื่อค้นหาข้อมูลล่าสุดใน MongoDB
    const staffMember = await Staff.findOne({
      email: req.user.email.toLowerCase()
    }).lean();

    if (!staffMember) {
      return res.status(404).json({
        error: "ไม่พบบัญชีผู้ใช้"
      });
    }

    const user = {
      id: staffMember._id.toString(),
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      registeredAt: staffMember.registeredAt
    };

    res.json({ user });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}


// เข้าสู่ระบบด้วยอีเมล
async function login(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "กรุณาระบุอีเมล"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    let found = await Staff.findOne({
      email: cleanEmail
    });

    // รองรับ admin
    if (
      !found &&
      (
        cleanEmail === "admin" ||
        cleanEmail === "admin@library.com" ||
        cleanEmail === "admin@gmail.com"
      )
    ) {
      found = await Staff.findOne({
        role: "ผู้ดูแลระบบ"
      });
    }

    if (!found) {
      return res.status(404).json({
        error: "ไม่พบบัญชีผู้ใช้นี้ในระบบบุคลากร กรุณาลงทะเบียนบรรณารักษ์ก่อน"
      });
    }

    const currentUser = {
      id: found._id.toString(),
      name: found.name,
      email: found.email,
      role: found.role,
      registeredAt: found.registeredAt
    };

    // สร้าง Token เฉพาะผู้ใช้คนนี้
    const token = generateToken(currentUser);

    res.json({
      user: currentUser,
      token
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}


// ลงทะเบียนผู้ใช้ / บรรณารักษ์ใหม่
async function register(req, res) {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "กรุณาระบุชื่อและอีเมล"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const cleanPhone = phone
      ? phone.replace(/[^0-9]/g, "").slice(0, 10)
      : "-";

    const staffExists = await Staff.findOne({
      email: cleanEmail
    });

    if (staffExists) {
      return res.status(400).json({
        error: "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ"
      });
    }

    const assignedRole = "บรรณารักษ์";

    const newId = await generateNextId(
      Staff,
      "ST"
    );

    const newStaff = await Staff.create({
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      phone: cleanPhone || "-",
      registeredAt: formatDateThai(new Date())
    });

    const currentUser = {
      id: newStaff._id.toString(),
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      registeredAt: newStaff.registeredAt
    };

    // สร้าง Token เฉพาะผู้ใช้ใหม่
    const token = generateToken(currentUser);

    res.json({
      user: currentUser,
      token
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}


// ออกจากระบบ
async function logout(req, res) {
  // JWT เป็น Stateless
  // ไม่ต้องลบ Session ใน MongoDB
  res.json({
    ok: true
  });
}


// แก้ไขข้อมูลโปรไฟล์
async function updateProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "ยังไม่ได้เข้าสู่ระบบ"
      });
    }

    const { name, role } = req.body;

    const staffMember = await Staff.findOne({
      email: req.user.email.toLowerCase()
    });

    if (!staffMember) {
      return res.status(404).json({
        error: "ไม่พบบัญชีผู้ใช้"
      });
    }

    if (name) {
      staffMember.name = name.trim();
    }

    if (role) {
      staffMember.role = role;
    }

    await staffMember.save();

    const user = {
      id: staffMember._id.toString(),
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      registeredAt: staffMember.registeredAt
    };

    res.json({
      user
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
}


module.exports = {
  getMe,
  login,
  register,
  logout,
  updateProfile
};