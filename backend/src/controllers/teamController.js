const Team = require('../models/Team');
const User = require('../models/User');

const Commission = require('../models/Commission');
const { AppError } = require('../middleware/errorHandler');

exports.createTeam = async (req, res, next) => {
  try {
    const team = await Team.create({
      ...req.body,
      manager: req.user._id
    });
    res.status(201).json({
      status: 'success',
      data: { team }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTeams = async (req, res, next) => {
  try {
    const teams = await Team.find()
      .populate('manager', 'name email')
      .populate('members', 'name email');
    res.status(200).json({
      status: 'success',
      results: teams.length,
      data: { teams }
    });
  } catch (err) {
    next(err);
  }
};

exports.getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('members', 'name email');
    
    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { team }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return next(new AppError('No team found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

// Get direct downline team members for an agent or company
exports.getMyDownline = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.userType === 'agent') {
      query.referredBy = req.user._id;
    } else if (req.user.userType === 'company') {
      // For a company, get all users who registered using this company's referral code
      query.referredBy = req.user._id;
    }

    const downline = await User.find(query).select('-password');

    res.status(200).json({
      status: 'success',
      results: downline.length,
      data: { downline }
    });
  } catch (err) {
    next(err);
  }
};

// Get personal sales and commissions for an agent
exports.getMySales = async (req, res, next) => {
  try {
    const personalCommissions = await Commission.find({ agent: req.user._id })
      .populate('lead');

    res.status(200).json({
      status: 'success',
      data: {
        personalSales: personalCommissions, // Sales are represented by commissions on leads
        personalCommissions
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get overall company sales and commissions (for company users)
exports.getCompanySales = async (req, res, next) => {
  try {
    // Get all agents belonging to this company
    const companyAgents = await User.find({ companyName: req.user.companyName, userType: 'agent' });
    const agentIds = companyAgents.map(agent => agent._id);

    const companyCommissions = await Commission.find({ agent: { $in: agentIds } })
      .populate('lead')
      .populate('agent', 'name');

    res.status(200).json({
      status: 'success',
      data: {
        companySales: companyCommissions, // Sales are represented by commissions
        companyCommissions,
        companyAgents
      }
    });
  } catch (err) {
    next(err);
  }
}; 