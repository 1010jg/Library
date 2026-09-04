const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const staffRoutes = require("./staffRoutes");
const bookRoutes = require("./bookRoutes");
const memberRoutes = require("./memberRoutes");
const borrowRoutes = require("./borrowRoutes");
const fineRoutes = require("./fineRoutes");
const policyRoutes = require("./policyRoutes");
const systemRoutes = require("./systemRoutes");

router.use("/auth", authRoutes);
router.use("/staff", staffRoutes);
router.use("/books", bookRoutes);
router.use("/members", memberRoutes);
router.use("/borrows", borrowRoutes);
router.use("/fines", fineRoutes);
router.use("/policy", policyRoutes);
router.use("/", systemRoutes); // mount /system/reset และ /health

module.exports = router;
