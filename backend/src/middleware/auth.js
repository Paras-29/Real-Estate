const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    console.log('DEBUG - Auth - Starting protect middleware');
    
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('DEBUG - Auth - Token received:', token.substring(0, 10) + '...');
    }

    if (!token) {
      console.log('DEBUG - Auth - No token provided');
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('DEBUG - Auth - Token decoded:', { id: decoded.id, userType: decoded.userType });

    const currentUser = await User.findById(decoded.id).select(
      '_id userType firstName lastName email phone companyName address licenseNumber level referralCode referredBy personalSalesVolume teamSalesVolume personalSalesCount teamSalesCount'
    );

    if (!currentUser) {
      console.log('DEBUG - Auth - User not found for ID:', decoded.id);
      return next(new AppError('User no longer exists.', 401));
    }

    if (!currentUser.firstName || !currentUser.lastName || !currentUser.email || !currentUser.phone) {
      console.error('DEBUG - Auth - Incomplete user profile');
      return next(new AppError('Incomplete user profile. Please contact support.', 400));
    }

    if (!currentUser.userType) {
      console.error('DEBUG - Auth - UserType missing in DB');
      return next(new AppError('User type not set. Please contact support.', 500));
    }

    console.log('DEBUG - Auth - User authenticated:', { id: currentUser._id, userType: currentUser.userType });

    req.user = currentUser;
    next();

  } catch (err) {
    console.error('DEBUG - Auth - Error in protect middleware:', { message: err.message });

    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }

    return next(new AppError('Authentication failed.', 401));
  }
};

const restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user || !req.user.userType) {
      return next(new AppError('User not authenticated or userType missing.', 401));
    }
    if (!userTypes.includes(req.user.userType)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
