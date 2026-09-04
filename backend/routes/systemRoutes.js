const express = require("express");
const router = express.Router();
const systemController = require("../controllers/systemController");

router.post("/system/reset", systemController.resetSystem);
router.get("/health", systemController.healthCheck);

module.exports = router;
