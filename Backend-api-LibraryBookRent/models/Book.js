const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    availableCopies: { type: Number, default: 1, min: 0 },
    totalCopies: { type: Number, default: 1, min: 0 },
    coverImageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
