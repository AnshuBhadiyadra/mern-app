const express = require('express');
const router = express.Router();
const {
  updateOnboarding, skipOnboarding, updateProfile, getProfile,
  toggleFollowOrganizer, getOrganizers, getOrganizerDetail,
} = require('../controllers/participantController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

router.use(protect);
router.use(checkRole('participant'));

router.put('/onboarding', updateOnboarding);
router.post('/skip-onboarding', skipOnboarding);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/follow/:organizerId', toggleFollowOrganizer);
router.get('/organizers', getOrganizers);
router.get('/organizers/:id', getOrganizerDetail);

module.exports = router;
