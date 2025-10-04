const Commission = require('../models/Commission');
const { AppError } = require('../middleware/errorHandler');

exports.createCommission = async (req, res, next) => {
  try {
    const commission = await Commission.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { commission }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCommissions = async (req, res, next) => {
  try {
    const commissions = await Commission.find()
      .populate('property', 'title price')
      .populate('agent', 'name email');
    res.status(200).json({
      status: 'success',
      results: commissions.length,
      data: { commissions }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findById(req.params.id)
      .populate('property', 'title price')
      .populate('agent', 'name email');
    
    if (!commission) {
      return next(new AppError('No commission found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { commission }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!commission) {
      return next(new AppError('No commission found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { commission }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCommission = async (req, res, next) => {
  try {
    const commission = await Commission.findByIdAndDelete(req.params.id);

    if (!commission) {
      return next(new AppError('No commission found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
}; 