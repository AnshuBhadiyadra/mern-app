const Discussion = require('../models/Discussion');
const Participant = require('../models/Participant');
const Organizer = require('../models/Organizer');
const Registration = require('../models/Registration');

// @desc    Get messages for an event
// @route   GET /api/discussions/:eventId
const getMessages = async (req, res) => {
  try {
    const messages = await Discussion.find({
      event: req.params.eventId,
      isDeleted: false,
    })
      .populate('participant', 'firstName lastName')
      .populate('organizer', 'organizerName')
      .sort({ isPinned: -1, createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Post a message
// @route   POST /api/discussions/:eventId
const postMessage = async (req, res) => {
  try {
    const { message, replyTo } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    let msgData = { event: req.params.eventId, message: message.trim() };
    if (replyTo) msgData.replyTo = replyTo;

    if (req.user.role === 'participant') {
      const participant = await Participant.findOne({ userId: req.user._id });
      if (!participant) return res.status(404).json({ success: false, error: 'Participant not found' });

      // Check if registered for the event
      const registration = await Registration.findOne({
        participant: participant._id,
        event: req.params.eventId,
        status: 'CONFIRMED',
      });
      if (!registration) {
        return res.status(403).json({ success: false, error: 'Only registered participants can post messages' });
      }

      msgData.participant = participant._id;
    } else if (req.user.role === 'organizer') {
      const organizer = await Organizer.findOne({ userId: req.user._id });
      if (!organizer) return res.status(404).json({ success: false, error: 'Organizer not found' });
      msgData.organizer = organizer._id;
    }

    const newMessage = await Discussion.create(msgData);
    const populated = await Discussion.findById(newMessage._id)
      .populate('participant', 'firstName lastName')
      .populate('organizer', 'organizerName');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Pin/unpin message (organizer only)
// @route   PUT /api/discussions/:messageId/pin
const togglePin = async (req, res) => {
  try {
    const msg = await Discussion.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });

    msg.isPinned = !msg.isPinned;
    await msg.save();

    res.status(200).json({ success: true, data: msg, message: msg.isPinned ? 'Message pinned' : 'Message unpinned' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete message (organizer only)
// @route   DELETE /api/discussions/:messageId
const deleteMessage = async (req, res) => {
  try {
    const msg = await Discussion.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });

    msg.isDeleted = true;
    await msg.save();

    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    React to a message
// @route   POST /api/discussions/:messageId/react
const reactToMessage = async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ success: false, error: 'Emoji is required' });

    const msg = await Discussion.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ success: false, error: 'Message not found' });

    // Toggle reaction
    const existingIdx = msg.reactions.findIndex(
      r => r.userId.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingIdx > -1) {
      msg.reactions.splice(existingIdx, 1);
    } else {
      msg.reactions.push({ userId: req.user._id, emoji });
    }

    await msg.save();
    res.status(200).json({ success: true, data: msg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getMessages,
  postMessage,
  togglePin,
  deleteMessage,
  reactToMessage,
};
