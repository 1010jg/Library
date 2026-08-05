const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: false, unique: true, lowercase: true, trim: true, sparse: true },
    phone: { type: String, default: '' },
    password: {
      type: String,
      required: function () {
        return this.memberType === 'registered';
      },
    },
    memberType: {
      type: String,
      enum: ['guest', 'registered'],
      default: 'registered',
    },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
