const mongoose = require("mongoose");

const fineSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    memberName: { type: String, required: true },
    reason: { type: String, default: "ส่งคืนหนังสือเกินกำหนด" },
    amount: { type: Number, required: true, default: 10 },
    date: { type: String },
    status: { type: String, default: "ค้างชำระ" }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Fine", fineSchema);
