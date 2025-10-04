const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  getMyDownline,
  getMySales,
  getCompanySales
} = require('../controllers/teamController');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Agent and company specific routes (must come before /:id routes)
router.get('/my-downline', restrictTo('agent', 'company'), getMyDownline);
router.get('/my-sales', restrictTo('agent', 'company'), getMySales);
router.get('/company-sales', restrictTo('company'), getCompanySales);

// Team management routes
router.route('/')
  .get(getTeams)
  .post(restrictTo('admin'), createTeam);

router.route('/:id')
  .get(getTeam)
  .patch(restrictTo('admin'), updateTeam)
  .delete(restrictTo('admin'), deleteTeam);

module.exports = router; 