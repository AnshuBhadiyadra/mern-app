const Participant = require('../models/Participant');
const Organizer = require('../models/Organizer');

// @desc    Update onboarding preferences
// @route   PUT /api/participants/onboarding
const updateOnboarding = async (req, res) => {
  try {
    const { interests, followedClubs } = req.body;
    const participant = await Participant.findOne({ userId: req.user._id });

    if (!participant) return res.status(404).json({ success: false, error: 'Participant not found' });

    if (interests) participant.interests = interests;
    if (followedClubs) participant.followedClubs = followedClubs;
    participant.onboardingComplete = true;

    await participant.save();

    res.status(200).json({ success: true, data: participant, message: 'Onboarding completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Skip onboarding
// @route   POST /api/participants/skip-onboarding
const skipOnboarding = async (req, res) => {
  try {
    const participant = await Participant.findOne({ userId: req.user._id });
    if (!participant) return res.status(404).json({ success: false, error: 'Participant not found' });

    participant.onboardingComplete = true;
    await participant.save();

    res.status(200).json({ success: true, message: 'Onboarding skipped' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update participant profile
// @route   PUT /api/participants/profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, contactNumber, collegeName, interests } = req.body;
    const participant = await Participant.findOne({ userId: req.user._id });

    if (!participant) return res.status(404).json({ success: false, error: 'Participant not found' });

    if (firstName) participant.firstName = firstName;
    if (lastName) participant.lastName = lastName;
    if (contactNumber) participant.contactNumber = contactNumber;
    if (collegeName) participant.collegeName = collegeName;
    if (interests) participant.interests = interests;

    await participant.save();

    res.status(200).json({ success: true, data: participant, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get participant profile
// @route   GET /api/participants/profile
const getProfile = async (req, res) => {
  try {
    const participant = await Participant.findOne({ userId: req.user._id })
      .populate('followedClubs', 'organizerName category description');

    if (!participant) return res.status(404).json({ success: false, error: 'Participant not found' });

    res.status(200).json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Follow/unfollow organizer
// @route   POST /api/participants/follow/:organizerId
const toggleFollowOrganizer = async (req, res) => {
  try {
    const participant = await Participant.findOne({ userId: req.user._id });
    if (!participant) return res.status(404).json({ success: false, error: 'Participant not found' });

    const organizer = await Organizer.findById(req.params.organizerId);
    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    const index = participant.followedClubs.indexOf(req.params.organizerId);
    if (index > -1) {
      participant.followedClubs.splice(index, 1);
      await participant.save();
      return res.status(200).json({ success: true, data: participant, message: 'Unfollowed' });
    } else {
      participant.followedClubs.push(req.params.organizerId);
      await participant.save();
      return res.status(200).json({ success: true, data: participant, message: 'Followed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all organizers listing
// @route   GET /api/participants/organizers
const getOrganizers = async (req, res) => {
  try {
    const organizers = await Organizer.find({ isApproved: true })
      .select('organizerName category description contactEmail')
      .sort({ organizerName: 1 });

    res.status(200).json({ success: true, count: organizers.length, data: organizers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get organizer detail
// @route   GET /api/participants/organizers/:id
const getOrganizerDetail = async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id)
      .select('organizerName category description contactEmail');

    if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });

    // Get organizer's events
    const Event = require('../models/Event');
    const now = new Date();
    const upcomingEvents = await Event.find({
      organizer: organizer._id,
      status: { $in: ['PUBLISHED', 'ONGOING'] },
      eventStartDate: { $gte: now },
    }).sort({ eventStartDate: 1 });

    const pastEvents = await Event.find({
      organizer: organizer._id,
      status: { $in: ['COMPLETED', 'CLOSED'] },
    }).sort({ eventEndDate: -1 });

    res.status(200).json({
      success: true,
      data: { organizer, upcomingEvents, pastEvents },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  updateOnboarding,
  skipOnboarding,
  updateProfile,
  getProfile,
  toggleFollowOrganizer,
  getOrganizers,
  getOrganizerDetail,
};
