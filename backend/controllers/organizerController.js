const Organizer = require('../models/Organizer');
const PasswordResetRequest = require('../models/PasswordResetRequest');

// @desc    Update organizer profile
// @route   PUT /api/organizers/profile
const updateProfile = async (req, res) => {
  try {
    const { organizerName, category, description, contactEmail, contactNumber, discordWebhook } = req.body;
    const organizer = await Organizer.findOne({ userId: req.user._id });

    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    if (organizerName) organizer.organizerName = organizerName;
    if (category) organizer.category = category;
    if (description) organizer.description = description;
    if (contactEmail) organizer.contactEmail = contactEmail;
    if (contactNumber) organizer.contactNumber = contactNumber;
    if (discordWebhook !== undefined) organizer.discordWebhook = discordWebhook;

    await organizer.save();

    res.status(200).json({ success: true, data: organizer, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get organizer profile
// @route   GET /api/organizers/profile
const getProfile = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.user._id });
    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    res.status(200).json({ success: true, data: organizer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/organizers/request-password-reset
const requestPasswordReset = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ success: false, error: 'Please provide a reason' });

    const organizer = await Organizer.findOne({ userId: req.user._id });
    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    // Check for existing pending request
    const existingRequest = await PasswordResetRequest.findOne({
      organizer: organizer._id,
      status: 'PENDING',
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, error: 'A pending password reset request already exists' });
    }

    const request = await PasswordResetRequest.create({
      organizer: organizer._id,
      reason,
    });

    res.status(201).json({ success: true, data: request, message: 'Password reset request submitted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get my password reset requests
// @route   GET /api/organizers/password-reset-history
const getPasswordResetHistory = async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.user._id });
    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    const requests = await PasswordResetRequest.find({ organizer: organizer._id })
      .sort({ requestedAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  updateProfile,
  getProfile,
  requestPasswordReset,
  getPasswordResetHistory,
};
