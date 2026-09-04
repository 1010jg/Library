const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    borrowDays: { type: Number, default: 14 },
    maxBooks: { type: Number, default: 5 },
    finePerDay: { type: Number, default: 5 }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Policy", policySchema);
