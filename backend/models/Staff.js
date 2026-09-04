const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "บรรณารักษ์" },
    phone: { type: String, default: "-" },
    registeredAt: { type: String }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Staff", staffSchema);
