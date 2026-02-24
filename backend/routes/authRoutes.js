const express = require('express');
const router = express.Router();
const {
  registerParticipant, loginUser, getMe, logoutUser, changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerLimiter, loginLimiter, verifyRecaptcha } = require('../middleware/recaptcha');

router.post('/register/participant', registerLimiter, verifyRecaptcha, registerParticipant);
router.post('/login', loginLimiter, verifyRecaptcha, loginUser);
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);
router.put('/change-password', protect, changePassword);

module.exports = router;
