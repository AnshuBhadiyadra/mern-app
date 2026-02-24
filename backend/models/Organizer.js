const mongoose = require('mongoose');

const organizerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    organizerName: {
      type: String,
      required: [true, 'Please provide organizer name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      enum: [
        'Technical',
        'Cultural',
        'Sports',
        'Literary',
        'Arts',
        'Music',
        'Dance',
        'Drama',
        'Gaming',
        'Social',
        'Management',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Please provide contact email'],
      lowercase: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      match: [/^\d{10}$/, 'Please provide a valid 10-digit contact number'],
    },
    discordWebhook: {
      type: String,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

organizerSchema.index({ userId: 1 });
organizerSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Organizer', organizerSchema);
