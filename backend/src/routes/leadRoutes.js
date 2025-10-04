const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  transferLead,
  setReminder
} = require('../controllers/leadController');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Lead routes
router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLead)
  .patch(updateLead)
  .delete(deleteLead);

router.patch('/:id/transfer', transferLead);
router.patch('/:id/reminder', setReminder);

module.exports = router; 