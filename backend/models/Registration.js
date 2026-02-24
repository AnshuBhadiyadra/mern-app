const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    registrationType: {
      type: String,
      enum: ['NORMAL', 'MERCHANDISE'],
      required: true,
    },
    ticketId: {
      type: String,
      unique: true,
      sparse: true,
    },
    qrCode: {
      type: String, // Base64 data URL
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED'],
      default: 'CONFIRMED',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'NOT_REQUIRED'],
      default: 'NOT_REQUIRED',
    },
    paymentProof: {
      type: String,
    },
    customFormData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    merchandiseDetails: {
      itemName: String,
      size: String,
      color: String,
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      totalPrice: {
        type: Number,
        min: 0,
      },
    },
    attendance: {
      marked: {
        type: Boolean,
        default: false,
      },
      timestamp: Date,
      markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organizer',
      },
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique ticket ID
registrationSchema.methods.generateTicket = function () {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  this.ticketId = `FEL-${timestamp}-${random}`;
};

// Prevent duplicate registrations
registrationSchema.index({ participant: 1, event: 1 }, { unique: true });
registrationSchema.index({ event: 1, status: 1 });
registrationSchema.index({ participant: 1, registrationType: 1 });
registrationSchema.index({ ticketId: 1 });
registrationSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Registration', registrationSchema);
