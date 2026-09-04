const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, default: "คอมพิวเตอร์" },
    isbn: { type: String, default: "-" },
    total: { type: Number, required: true, default: 1 },
    available: { type: Number, required: true, default: 1 }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model("Book", bookSchema);
