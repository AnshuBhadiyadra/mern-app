const User = require('../models/User');
const Organizer = require('../models/Organizer');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Discussion = require('../models/Discussion');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { sendOrganizerCredentials, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');

const generatePassword = () => crypto.randomBytes(4).toString('hex');

// Generate a standard club email: clubname@clubs.iiit.ac.in
const generateClubEmail = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${slug}@clubs.iiit.ac.in`;
};

// @desc    Create organizer account
// @route   POST /api/admin/organizers
const createOrganizer = async (req, res) => {
  try {
    const { organizerName, category, description, contactEmail, contactNumber } = req.body;

    if (!organizerName || !category) {
      return res.status(400).json({ success: false, error: 'Please provide organizer name and category' });
    }

    // Auto-generate email if not provided
    const email = contactEmail || generateClubEmail(organizerName);
    const desc = description || `${organizerName} - ${category} organization at Felicity`;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const password = generatePassword();

    const user = await User.create({ email, password, role: 'organizer' });

    const organizer = await Organizer.create({
      userId: user._id, organizerName, category, description: desc,
      contactEmail: email, contactNumber, isApproved: true,
    });

    sendOrganizerCredentials(email, organizerName, email, password)
      .catch(err => console.error('Email failed:', err));

    res.status(201).json({
      success: true,
      data: {
        organizer,
        credentials: { email, password },
      },
      message: 'Organizer account created successfully.',
    });
  } catch (error) {
    console.error('Create organizer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all organizers
// @route   GET /api/admin/organizers
const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find()
      .populate('userId', 'email isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: organizers.length, data: organizers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve organizer
// @route   PUT /api/admin/organizers/:id/approve
const approveOrganizer = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    organizer.isApproved = true;
    await organizer.save();

    res.status(200).json({ success: true, data: organizer, message: 'Organizer approved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete/deactivate organizer (cascade deletes all associated data)
// @route   DELETE /api/admin/organizers/:id
const deleteOrganizer = async (req, res) => {
  try {
    const { permanent } = req.query;
    const organizer = await Organizer.findById(req.params.id);
    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    if (permanent === 'true') {
      // Cascade: delete all events, registrations, discussions, password resets
      const events = await Event.find({ organizer: organizer._id });
      const eventIds = events.map(e => e._id);

      await Registration.deleteMany({ event: { $in: eventIds } });
      await Discussion.deleteMany({ event: { $in: eventIds } });
      await Event.deleteMany({ organizer: organizer._id });
      await PasswordResetRequest.deleteMany({ organizer: organizer._id });
      await Organizer.findByIdAndDelete(organizer._id);
      await User.findByIdAndDelete(organizer.userId);

      return res.status(200).json({ success: true, message: 'Organizer and all associated data permanently deleted' });
    }

    // Soft deactivate
    const user = await User.findById(organizer.userId);
    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: 'Organizer account deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get password reset requests
// @route   GET /api/admin/password-resets
const getPasswordResetRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) query.status = status;

    const requests = await PasswordResetRequest.find(query)
      .populate('organizer', 'organizerName contactEmail')
      .sort({ requestedAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Approve password reset
// @route   PUT /api/admin/password-resets/:id/approve
const approvePasswordReset = async (req, res) => {
  try {
    const { adminComments } = req.body;
    const request = await PasswordResetRequest.findById(req.params.id).populate('organizer');

    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Request is already ${request.status.toLowerCase()}` });
    }

    const newPassword = generatePassword();
    const user = await User.findById(request.organizer.userId).select('+password');
    user.password = newPassword;
    await user.save();

    request.status = 'APPROVED';
    request.adminComments = adminComments;
    request.newPassword = newPassword;
    request.resolvedAt = new Date();
    request.resolvedBy = req.user._id;
    await request.save();

    sendPasswordResetEmail(request.organizer.contactEmail, request.organizer.organizerName, newPassword)
      .catch(err => console.error('Email failed:', err));

    res.status(200).json({
      success: true,
      data: { request, newPassword },
      message: 'Password reset approved.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reject password reset
// @route   PUT /api/admin/password-resets/:id/reject
const rejectPasswordReset = async (req, res) => {
  try {
    const { adminComments } = req.body;
    const request = await PasswordResetRequest.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: `Request is already ${request.status.toLowerCase()}` });
    }

    request.status = 'REJECTED';
    request.adminComments = adminComments || 'Request rejected';
    request.resolvedAt = new Date();
    request.resolvedBy = req.user._id;
    await request.save();

    res.status(200).json({ success: true, data: request, message: 'Password reset rejected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getAdminStats = async (req, res) => {
  try {
    const totalOrganizers = await Organizer.countDocuments();
    const activeOrganizers = await User.countDocuments({ role: 'organizer', isActive: true });
    const pendingApprovals = await Organizer.countDocuments({ isApproved: false });
    const pendingResets = await PasswordResetRequest.countDocuments({ status: 'PENDING' });
    const totalEvents = await Event.countDocuments();
    const totalParticipants = await User.countDocuments({ role: 'participant' });

    res.status(200).json({
      success: true,
      data: {
        totalOrganizers,
        activeOrganizers,
        pendingApprovals,
        pendingResets,
        totalEvents,
        totalParticipants,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createOrganizer,
  getAllOrganizers,
  approveOrganizer,
  deleteOrganizer,
  getPasswordResetRequests,
  approvePasswordReset,
  rejectPasswordReset,
  getAdminStats,
};
