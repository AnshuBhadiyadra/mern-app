const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      trim: true,
    },
    participantType: {
      type: String,
      enum: ['IIIT', 'NON_IIIT'],
      required: true,
    },
    collegeName: {
      type: String,
      required: [true, 'Please provide college/organization name'],
      trim: true,
    },
    contactNumber: {
      type: String,
      required: [true, 'Please provide contact number'],
      match: [/^\d{10}$/, 'Please provide a valid 10-digit contact number'],
    },
    interests: {
      type: [String],
      default: [],
    },
    followedClubs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
      },
    ],
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

participantSchema.index({ userId: 1 });

module.exports = mongoose.model('Participant', participantSchema);
