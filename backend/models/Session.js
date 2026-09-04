const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    key: { type: String, default: "active_user", unique: true },
    user: {
      name: { type: String },
      email: { type: String },
      role: { type: String },
      registeredAt: { type: String }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Session", sessionSchema);
