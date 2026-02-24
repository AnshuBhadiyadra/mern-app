const express = require('express');
const router = express.Router();
const {
  registerForEvent, purchaseMerchandise, uploadPaymentProof,
  approvePayment, rejectPayment, getMyRegistrations,
  getEventParticipants, markAttendance, exportParticipants,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');
const upload = require('../utils/fileUpload');

// Participant routes
router.post('/event/:eventId', protect, checkRole('participant'), registerForEvent);
router.post('/merchandise/:eventId', protect, checkRole('participant'), purchaseMerchandise);
router.post('/:registrationId/payment-proof', protect, checkRole('participant'), upload.single('paymentProof'), uploadPaymentProof);
router.get('/my-registrations', protect, checkRole('participant'), getMyRegistrations);

// Organizer routes
router.get('/event/:eventId/participants', protect, checkRole('organizer'), getEventParticipants);
router.put('/:registrationId/approve-payment', protect, checkRole('organizer'), approvePayment);
router.put('/:registrationId/reject-payment', protect, checkRole('organizer'), rejectPayment);
router.post('/:registrationId/mark-attendance', protect, checkRole('organizer'), markAttendance);
router.get('/event/:eventId/export', protect, checkRole('organizer'), exportParticipants);

module.exports = router;
