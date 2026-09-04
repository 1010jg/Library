const express = require("express");
const router = express.Router();
const fineController = require("../controllers/fineController");

router.get("/", fineController.getFines);
router.post("/", fineController.createFine);
router.post("/:id/pay", fineController.payFine);

module.exports = router;
