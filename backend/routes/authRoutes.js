const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const {
    verifyToken
} = require("../middleware/authMiddleware");

// ดึงข้อมูลผู้ใช้ที่กำลัง Login
router.get(
    "/me",
    verifyToken,
    authController.getMe
);

// Login
router.post(
    "/login",
    authController.login
);

// Register
router.post(
    "/register",
    authController.register
);

// Logout
router.post(
    "/logout",
    authController.logout
);

// แก้ไข Profile ต้อง Login ก่อน
router.put(
    "/profile",
    verifyToken,
    authController.updateProfile
);

module.exports = router;