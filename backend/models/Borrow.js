const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    memberName: { type: String, required: true },
    bookTitle: { type: String, required: true },
    borrowDate: { type: String },
    returnDate: { type: String },
    status: { type: String, default: "กำลังยืม" }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Borrow", borrowSchema);
