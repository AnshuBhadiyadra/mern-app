const express = require('express');
const router = express.Router();
const {
  getMessages, postMessage, togglePin, deleteMessage, reactToMessage,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Get messages (participant or organizer)
router.get('/:eventId', protect, getMessages);

// Post message (participant or organizer)
router.post('/:eventId', protect, postMessage);

// Pin/delete (organizer moderation)
router.put('/:messageId/pin', protect, checkRole('organizer'), togglePin);
router.delete('/:messageId', protect, checkRole('organizer'), deleteMessage);

// React to a message
router.post('/:messageId/react', protect, reactToMessage);

module.exports = router;
