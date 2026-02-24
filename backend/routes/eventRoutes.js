const express = require('express');
const router = express.Router();
const {
  createEvent, getEvents, getEventById, getTrendingEvents,
  updateEvent, publishEvent, closeEvent, getOrganizerEvents, getEventAnalytics,
} = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

// Public routes
router.get('/trending', getTrendingEvents);
router.get('/', optionalAuth, getEvents);

// Organizer routes (must come before /:id)
router.get('/organizer/my-events', protect, checkRole('organizer'), getOrganizerEvents);
router.post('/', protect, checkRole('organizer'), createEvent);
router.post('/:id/publish', protect, checkRole('organizer'), publishEvent);
router.post('/:id/close', protect, checkRole('organizer'), closeEvent);
router.get('/:id/analytics', protect, checkRole('organizer'), getEventAnalytics);
router.put('/:id', protect, checkRole('organizer'), updateEvent);

// Public event detail (after specific routes)
router.get('/:id', getEventById);

module.exports = router;
