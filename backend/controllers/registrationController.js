const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const Organizer = require('../models/Organizer');
const User = require('../models/User');
const { generateQR } = require('../utils/qrGenerator');
const { sendTicketEmail } = require('../utils/emailService');

// @desc    Register for normal event
// @route   POST /api/registrations/event/:eventId
const registerForEvent = async (req, res) => {
  try {
    const { customFormData } = req.body;
    const eventId = req.params.eventId;

    const participant = await Participant.findOne({ userId: req.user._id });
    const user = await User.findById(req.user._id);

    if (!participant) return res.status(404).json({ success: false, error: 'Participant profile not found' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    if (event.eventType !== 'NORMAL') {
      return res.status(400).json({ success: false, error: 'This endpoint is for normal events only' });
    }

    if (event.status !== 'PUBLISHED' && event.status !== 'ONGOING') {
      return res.status(400).json({ success: false, error: 'Event is not open for registration' });
    }

    const existingReg = await Registration.findOne({ participant: participant._id, event: eventId });
    if (existingReg) return res.status(400).json({ success: false, error: 'Already registered for this event' });

    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, error: 'Registration deadline has passed' });
    }

    if (event.currentRegistrations >= event.registrationLimit) {
      return res.status(400).json({ success: false, error: 'Registration limit reached' });
    }

    // Check eligibility
    if (event.eligibility === 'IIIT Only' && participant.participantType !== 'IIIT') {
      return res.status(403).json({ success: false, error: 'This event is only for IIIT students' });
    }
    if (event.eligibility === 'Non-IIIT Only' && participant.participantType === 'IIIT') {
      return res.status(403).json({ success: false, error: 'This event is only for non-IIIT participants' });
    }

    const registration = new Registration({
      participant: participant._id,
      event: eventId,
      registrationType: 'NORMAL',
      status: 'CONFIRMED',
      paymentStatus: event.registrationFee > 0 ? 'PENDING' : 'NOT_REQUIRED',
      customFormData: customFormData || {},
    });

    registration.generateTicket();
    const qrCode = await generateQR(registration.ticketId, eventId, participant._id.toString());
    registration.qrCode = qrCode;

    await registration.save();

    event.currentRegistrations += 1;
    if (event.currentRegistrations === 1) event.formLocked = true;
    await event.save();

    // Send ticket email (non-blocking)
    sendTicketEmail(user.email, {
      eventName: event.eventName,
      ticketId: registration.ticketId,
      qrCode,
      participantName: `${participant.firstName} ${participant.lastName}`,
      eventStartDate: event.eventStartDate,
      eventType: 'NORMAL',
    }).catch(err => console.error('Email failed:', err));

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Registration successful! Ticket sent to your email.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Purchase merchandise
// @route   POST /api/registrations/merchandise/:eventId
const purchaseMerchandise = async (req, res) => {
  try {
    const { itemName, size, color, quantity } = req.body;
    const eventId = req.params.eventId;

    const participant = await Participant.findOne({ userId: req.user._id });
    if (!participant) return res.status(404).json({ success: false, error: 'Participant profile not found' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

    if (event.eventType !== 'MERCHANDISE') {
      return res.status(400).json({ success: false, error: 'This endpoint is for merchandise events only' });
    }

    const existingPurchase = await Registration.findOne({ participant: participant._id, event: eventId });
    if (existingPurchase) return res.status(400).json({ success: false, error: 'Already purchased from this event' });

    const item = event.merchandiseDetails.items.find(
      i => i.name === itemName && (!size || i.size === size) && (!color || i.color === color)
    );
    if (!item) return res.status(404).json({ success: false, error: 'Merchandise item not found' });

    if (item.stock < (quantity || 1)) {
      return res.status(400).json({ success: false, error: 'Insufficient stock' });
    }

    const qty = quantity || 1;
    if (qty > event.merchandiseDetails.purchaseLimitPerUser) {
      return res.status(400).json({ success: false, error: `Purchase limit is ${event.merchandiseDetails.purchaseLimitPerUser} per user` });
    }

    const registration = new Registration({
      participant: participant._id,
      event: eventId,
      registrationType: 'MERCHANDISE',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      merchandiseDetails: {
        itemName, size, color,
        quantity: qty,
        totalPrice: item.price * qty,
      },
    });

    await registration.save();

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Order created. Please upload payment proof to complete purchase.',
    });
  } catch (error) {
    console.error('Merchandise purchase error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Upload payment proof
// @route   POST /api/registrations/:registrationId/payment-proof
const uploadPaymentProof = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId);
    const participant = await Participant.findOne({ userId: req.user._id });

    if (!registration) return res.status(404).json({ success: false, error: 'Registration not found' });

    if (registration.participant.toString() !== participant._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (registration.registrationType !== 'MERCHANDISE' && registration.paymentStatus === 'NOT_REQUIRED') {
      return res.status(400).json({ success: false, error: 'Payment proof is not required for this registration' });
    }

    if (registration.paymentStatus !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Payment is already ${registration.paymentStatus.toLowerCase()}` });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload payment proof image' });
    }

    registration.paymentProof = req.file.path;
    await registration.save();

    res.status(200).json({
      success: true,
      data: registration,
      message: 'Payment proof uploaded. Waiting for organizer approval.',
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve payment (organizer)
// @route   PUT /api/registrations/:registrationId/approve-payment
const approvePayment = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('participant').populate('event');
    const organizer = await Organizer.findOne({ userId: req.user._id });

    if (!registration) return res.status(404).json({ success: false, error: 'Registration not found' });

    if (registration.event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to approve this payment' });
    }

    if (registration.paymentStatus !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Payment is already ${registration.paymentStatus.toLowerCase()}` });
    }

    if (!registration.paymentProof) {
      return res.status(400).json({ success: false, error: 'No payment proof uploaded' });
    }

    const event = registration.event;
    const item = event.merchandiseDetails.items.find(
      i => i.name === registration.merchandiseDetails.itemName &&
           i.size === registration.merchandiseDetails.size &&
           i.color === registration.merchandiseDetails.color
    );

    if (!item || item.stock < registration.merchandiseDetails.quantity) {
      return res.status(400).json({ success: false, error: 'Insufficient stock' });
    }

    // Decrement stock
    item.stock -= registration.merchandiseDetails.quantity;
    event.currentRegistrations += 1;
    await event.save();

    // Generate ticket and QR
    const participant = await Participant.findById(registration.participant._id);
    const user = await User.findById(participant.userId);

    registration.generateTicket();
    const qrCode = await generateQR(registration.ticketId, event._id.toString(), participant._id.toString());
    registration.qrCode = qrCode;
    registration.status = 'CONFIRMED';
    registration.paymentStatus = 'APPROVED';
    await registration.save();

    // Send email
    sendTicketEmail(user.email, {
      eventName: event.eventName,
      ticketId: registration.ticketId,
      qrCode,
      participantName: `${participant.firstName} ${participant.lastName}`,
      eventStartDate: event.eventStartDate,
      eventType: 'MERCHANDISE',
      merchandiseDetails: registration.merchandiseDetails,
    }).catch(err => console.error('Email failed:', err));

    res.status(200).json({ success: true, data: registration, message: 'Payment approved and ticket generated' });
  } catch (error) {
    console.error('Approve payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reject payment
// @route   PUT /api/registrations/:registrationId/reject-payment
const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const registration = await Registration.findById(req.params.registrationId).populate('event');
    const organizer = await Organizer.findOne({ userId: req.user._id });

    if (!registration) return res.status(404).json({ success: false, error: 'Registration not found' });

    if (registration.event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (registration.paymentStatus !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Payment is already ${registration.paymentStatus.toLowerCase()}` });
    }

    registration.status = 'REJECTED';
    registration.paymentStatus = 'REJECTED';
    if (reason) registration.customFormData = { ...registration.customFormData, rejectionReason: reason };
    await registration.save();

    res.status(200).json({ success: true, data: registration, message: 'Payment rejected' });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my-registrations
const getMyRegistrations = async (req, res) => {
  try {
    const { type, status } = req.query;
    const participant = await Participant.findOne({ userId: req.user._id });
    if (!participant) return res.status(404).json({ success: false, error: 'Participant profile not found' });

    let query = { participant: participant._id };
    if (type && ['NORMAL', 'MERCHANDISE'].includes(type)) query.registrationType = type;
    if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED'].includes(status)) query.status = status;

    const registrations = await Registration.find(query)
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'organizerName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get event participants (organizer view)
// @route   GET /api/registrations/event/:eventId/participants
const getEventParticipants = async (req, res) => {
  try {
    const { paymentStatus, attendance, search, participantType } = req.query;
    const eventId = req.params.eventId;
    const organizer = await Organizer.findOne({ userId: req.user._id });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    let query = { event: eventId };
    if (paymentStatus && ['PENDING', 'APPROVED', 'REJECTED'].includes(paymentStatus)) query.paymentStatus = paymentStatus;
    if (attendance === 'marked') query['attendance.marked'] = true;
    else if (attendance === 'unmarked') query['attendance.marked'] = false;

    const registrations = await Registration.find(query)
      .populate({ path: 'participant', populate: { path: 'userId', select: 'email' } })
      .sort({ createdAt: -1 });

    let filtered = registrations;
    if (search) {
      const s = search.toLowerCase();
      filtered = registrations.filter(reg => {
        const fullName = `${reg.participant.firstName} ${reg.participant.lastName}`.toLowerCase();
        const email = reg.participant.userId.email.toLowerCase();
        return fullName.includes(s) || email.includes(s);
      });
    }
    if (participantType && ['IIIT', 'NON_IIIT'].includes(participantType)) {
      filtered = filtered.filter(reg => reg.participant.participantType === participantType);
    }

    res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    console.error('Get event participants error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark attendance (QR scan or manual)
// @route   POST /api/registrations/:registrationId/mark-attendance
const markAttendance = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const organizer = await Organizer.findOne({ userId: req.user._id });

    let registration;
    if (ticketId) {
      registration = await Registration.findOne({ ticketId }).populate('event').populate('participant');
    } else {
      registration = await Registration.findById(req.params.registrationId).populate('event').populate('participant');
    }

    if (!registration) return res.status(404).json({ success: false, error: 'Registration not found' });

    if (registration.event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (registration.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, error: 'Registration is not confirmed' });
    }

    if (registration.attendance.marked) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already marked',
        data: { markedAt: registration.attendance.timestamp },
      });
    }

    registration.attendance.marked = true;
    registration.attendance.timestamp = new Date();
    registration.attendance.markedBy = organizer._id;
    await registration.save();

    res.status(200).json({ success: true, data: registration, message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Export event participants as CSV
// @route   GET /api/registrations/event/:eventId/export
const exportParticipants = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const organizer = await Organizer.findOne({ userId: req.user._id });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    if (event.organizer.toString() !== organizer._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate({ path: 'participant', populate: { path: 'userId', select: 'email' } })
      .sort({ createdAt: 1 });

    const csvData = registrations.map(reg => ({
      'Ticket ID': reg.ticketId || 'N/A',
      'First Name': reg.participant.firstName,
      'Last Name': reg.participant.lastName,
      'Email': reg.participant.userId.email,
      'Contact': reg.participant.contactNumber,
      'College': reg.participant.collegeName,
      'Type': reg.participant.participantType,
      'Status': reg.status,
      'Payment': reg.paymentStatus,
      'Attendance': reg.attendance.marked ? 'Yes' : 'No',
      'Reg Date': new Date(reg.registrationDate).toLocaleString(),
    }));

    const { Parser } = require('json2csv');
    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${event.eventName.replace(/\s+/g, '_')}_participants.csv"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  registerForEvent,
  purchaseMerchandise,
  uploadPaymentProof,
  approvePayment,
  rejectPayment,
  getMyRegistrations,
  getEventParticipants,
  markAttendance,
  exportParticipants,
};
