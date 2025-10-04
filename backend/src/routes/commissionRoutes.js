const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const {
  createCommission,
  getCommissions,
  getCommission,
  updateCommission,
  deleteCommission
} = require('../controllers/commissionController');
const { testCommissionDistribution } = require('../services/commissionService');
const Commission = require('../models/Commission');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Test route for commission calculation (for development/testing)
router.get('/test-calculation', restrictTo('admin'), (req, res) => {
  try {
    const salePrice = parseInt(req.query.salePrice) || 1000000;
    const level = parseInt(req.query.level) || 2;
    
    const result = testCommissionDistribution(salePrice, level);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
});

// Agent and company routes (must come before other routes)
router.get('/my-commissions', restrictTo('agent', 'company'), async (req, res, next) => {
  try {
    let query = {};
    if (req.user.userType === 'agent') {
      query = { agent: req.user._id };
    } else if (req.user.userType === 'company') {
      query = { company: req.user.companyName };
    }
    
    const commissions = await Commission.find(query)
      .populate('property', 'title price')
      .populate('agent', 'firstName lastName email')
      .sort({ date: -1 }); // Sort by date, newest first
    
    res.status(200).json({
      status: 'success',
      results: commissions.length,
      data: { commissions }
    });
  } catch (err) {
    next(err);
  }
});

// Admin routes
router.use(restrictTo('admin'));

router.route('/')
  .get(getCommissions)
  .post(createCommission);

router.route('/:id')
  .get(getCommission)
  .patch(updateCommission)
  .delete(deleteCommission);

module.exports = router; 