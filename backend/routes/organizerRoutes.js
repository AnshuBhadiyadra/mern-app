const express = require('express');
const router = express.Router();
const {
  updateProfile, getProfile, requestPasswordReset, getPasswordResetHistory,
} = require('../controllers/organizerController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

router.use(protect);
router.use(checkRole('organizer'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/request-password-reset', requestPasswordReset);
router.get('/password-reset-history', getPasswordResetHistory);

module.exports = router;
