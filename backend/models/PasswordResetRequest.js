const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for password reset'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminComments: {
      type: String,
      trim: true,
      maxlength: [500, 'Comments cannot exceed 500 characters'],
    },
    newPassword: {
      type: String,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

passwordResetRequestSchema.index({ organizer: 1, status: 1 });
passwordResetRequestSchema.index({ status: 1, requestedAt: -1 });

module.exports = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
