const express = require('express');
const router = express.Router();
const {
  createOrganizer, getAllOrganizers, approveOrganizer, deleteOrganizer,
  getPasswordResetRequests, approvePasswordReset, rejectPasswordReset, getAdminStats,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

router.use(protect);
router.use(checkRole('admin'));

// Organizer management
router.post('/organizers', createOrganizer);
router.get('/organizers', getAllOrganizers);
router.put('/organizers/:id/approve', approveOrganizer);
router.delete('/organizers/:id', deleteOrganizer);

// Password reset management
router.get('/password-resets', getPasswordResetRequests);
router.put('/password-resets/:id/approve', approvePasswordReset);
router.put('/password-resets/:id/reject', rejectPasswordReset);

// Stats
router.get('/stats', getAdminStats);

module.exports = router;
