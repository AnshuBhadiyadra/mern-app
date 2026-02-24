const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide admin name'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.index({ userId: 1 });

module.exports = mongoose.model('Admin', adminSchema);
