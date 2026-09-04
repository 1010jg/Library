const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, default: "-" },
    email: { type: String, default: "-" },
    status: { type: String, default: "active" }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Member", memberSchema);
