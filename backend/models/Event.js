const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Please provide event name'],
      trim: true,
      maxlength: [200, 'Event name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['NORMAL', 'MERCHANDISE'],
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    eligibility: {
      type: String,
      enum: ['All', 'IIIT Only', 'Non-IIIT Only'],
      default: 'All',
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Please provide registration deadline'],
    },
    eventStartDate: {
      type: Date,
      required: [true, 'Please provide event start date'],
    },
    eventEndDate: {
      type: Date,
      required: [true, 'Please provide event end date'],
    },
    registrationLimit: {
      type: Number,
      min: [1, 'Registration limit must be at least 1'],
    },
    currentRegistrations: {
      type: Number,
      default: 0,
      min: 0,
    },
    registrationFee: {
      type: Number,
      default: 0,
      min: [0, 'Registration fee cannot be negative'],
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CLOSED'],
      default: 'DRAFT',
    },
    eventTags: {
      type: [String],
      default: [],
    },
    // Dynamic custom form fields for registration
    customFormFields: [
      {
        fieldName: {
          type: String,
          required: true,
        },
        fieldLabel: {
          type: String,
        },
        fieldType: {
          type: String,
          enum: ['text', 'textarea', 'select', 'checkbox', 'file', 'number', 'email', 'tel'],
          required: true,
        },
        required: {
          type: Boolean,
          default: false,
        },
        options: [String],
        placeholder: String,
        order: Number,
      },
    ],
    // Merchandise-specific details
    merchandiseDetails: {
      items: [
        {
          name: { type: String, required: true },
          size: String,
          color: String,
          stock: { type: Number, default: 0, min: 0 },
          price: { type: Number, default: 0, min: 0 },
        },
      ],
      purchaseLimitPerUser: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
    formLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ eventTags: 1 });
eventSchema.index({ status: 1, eventStartDate: 1 });
eventSchema.index({ eventName: 'text', description: 'text' });

// Validate dates before save
eventSchema.pre('save', function (next) {
  if (this.eventStartDate && this.eventEndDate) {
    if (this.eventEndDate < this.eventStartDate) {
      return next(new Error('Event end date must be after start date'));
    }
  }
  if (this.registrationDeadline && this.eventStartDate) {
    if (this.registrationDeadline > this.eventStartDate) {
      return next(new Error('Registration deadline must be before event start date'));
    }
  }
  next();
});

// Auto-update status based on current time
eventSchema.methods.computeStatus = function () {
  const now = new Date();
  if (this.status === 'DRAFT' || this.status === 'CLOSED') return this.status;
  if (this.status === 'PUBLISHED' && this.eventStartDate <= now) {
    this.status = 'ONGOING';
  }
  if ((this.status === 'ONGOING' || this.status === 'PUBLISHED') && this.eventEndDate <= now) {
    this.status = 'COMPLETED';
  }
  return this.status;
};

// Static helper to auto-update status for query results
eventSchema.statics.autoUpdateStatus = async function (events) {
  const now = new Date();
  const updates = [];
  for (const event of events) {
    const oldStatus = event.status;
    event.computeStatus();
    if (event.status !== oldStatus) {
      updates.push(event.save());
    }
  }
  if (updates.length > 0) await Promise.all(updates);
  return events;
};

module.exports = mongoose.model('Event', eventSchema);
