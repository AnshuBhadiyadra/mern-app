const User = require('../models/User');
const Participant = require('../models/Participant');
const Organizer = require('../models/Organizer');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Register participant
// @route   POST /api/auth/register/participant
const registerParticipant = async (req, res) => {
  try {
    const {
      firstName, lastName, email, password,
      participantType, collegeName, contactNumber,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !participantType || !collegeName || !contactNumber) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    // IIIT email domain validation
    if (participantType === 'IIIT') {
      if (!email.endsWith('@iiit.ac.in') && !email.endsWith('@students.iiit.ac.in')) {
        return res.status(400).json({
          success: false,
          error: 'IIIT participants must use @iiit.ac.in or @students.iiit.ac.in email',
        });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const user = await User.create({ email, password, role: 'participant' });

    const participant = await Participant.create({
      userId: user._id,
      firstName, lastName, participantType, collegeName, contactNumber,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, email: user.email, role: user.role },
        profile: {
          id: participant._id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          participantType: participant.participantType,
          onboardingComplete: participant.onboardingComplete,
        },
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error during registration' });
  }
};

// @desc    Login user (all roles)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account is inactive. Please contact administrator.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    let profile;
    if (user.role === 'participant') {
      profile = await Participant.findOne({ userId: user._id });
    } else if (user.role === 'organizer') {
      profile = await Organizer.findOne({ userId: user._id });
      if (!profile || !profile.isApproved) {
        return res.status(403).json({ success: false, error: 'Organizer account pending approval' });
      }
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ userId: user._id });
    }

    if (!profile) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: { id: user._id, email: user.email, role: user.role },
        profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = { id: req.user._id, email: req.user.email, role: req.user.role };

    let profile;
    if (req.user.role === 'participant') {
      profile = await Participant.findOne({ userId: req.user._id })
        .populate('followedClubs', 'organizerName category');
    } else if (req.user.role === 'organizer') {
      profile = await Organizer.findOne({ userId: req.user._id });
    } else if (req.user.role === 'admin') {
      profile = await Admin.findOne({ userId: req.user._id });
    }

    res.status(200).json({ success: true, data: { user, profile } });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  registerParticipant,
  loginUser,
  getMe,
  logoutUser,
  changePassword,
};
