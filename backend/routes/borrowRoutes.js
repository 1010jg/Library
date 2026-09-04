const express = require("express");
const router = express.Router();
const borrowController = require("../controllers/borrowController");

router.get("/", borrowController.getBorrows);
router.post("/", borrowController.createBorrow);
router.post("/:id/return", borrowController.returnBook);

module.exports = router;
