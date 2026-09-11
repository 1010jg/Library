const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * สร้าง JWT Token สำหรับผู้ใช้งาน
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id?.toString() || user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
}

/**
 * Middleware ตรวจสอบ JWT Token
 */
function verifyToken(req, res, next) {
  const authHeader =
    req.headers.authorization || req.headers.Authorization;

  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
  }

  if (!token) {
    return res.status(401).json({
      error: "ไม่พบ Token การยืนยันตัวตน กรุณาเข้าสู่ระบบ"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);

    return res.status(401).json({
      error: "Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่"
    });
  }
}

/**
 * Middleware สำหรับผู้ดูแลระบบ
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ผู้ดูแลระบบ") {
    return res.status(403).json({
      error: "ปฏิเสธการเข้าถึง: สำหรับผู้ดูแลระบบเท่านั้น"
    });
  }

  next();
}

/**
 * Middleware ตรวจสอบ Role
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "สิทธิ์การเข้าถึงไม่เพียงพอสำหรับการดำเนินการนี้"
      });
    }

    next();
  };
}

module.exports = {
  generateToken,
  verifyToken,
  requireAdmin,
  requireRole
};