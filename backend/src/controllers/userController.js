const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const generateToken = (user) => {
  if (!user.userType) {
    console.error('DEBUG - UserController - User type missing during token generation:', user);
    throw new Error('User type is required for token generation');
  }
  
  const payload = {
    id: user._id,
    userType: user.userType,
    email: user.email
  };
  
  console.log('DEBUG - UserController - Generating token with payload:', payload);
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }); // Increased token expiry
};

// Helper function to filter object fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Helper function to validate base64 string
const isValidBase64 = (str) => {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};

// Helper function to validate image size (max 5MB)
const isValidImageSize = (base64String) => {
  // Calculate size in bytes
  const sizeInBytes = Math.ceil((base64String.length * 3) / 4);
  const maxSize = 5 * 1024 * 1024; // 5MB
  return sizeInBytes <= maxSize;
};

// Helper function to validate registration data
const validateRegistrationData = (data, userType) => {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'password'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new AppError('Invalid email format', 400);
  }

  // Validate phone format (basic validation)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(data.phone)) {
    throw new AppError('Invalid phone number format', 400);
  }

  // Validate password strength
  if (data.password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }

  // Additional validation for company registration
  if (userType === 'company') {
    const companyFields = ['companyName', 'address', 'licenseNumber'];
    const missingCompanyFields = companyFields.filter(field => !data[field]);
    
    if (missingCompanyFields.length > 0) {
      throw new AppError(`Company registration requires: ${missingCompanyFields.join(', ')}`, 400);
    }
  }
};

// Helper function to validate referral code
const validateReferralCode = async (referralCode) => {
  if (!referralCode) return null;
  
  const referringUser = await User.findOne({ 
    referralCode,
    userType: { $in: ['agent', 'company'] } // Allow both agents and companies to refer others
  });
  
  if (!referringUser) {
    throw new AppError('Invalid referral code. No agent or company found with this code.', 400);
  }
  
  return referringUser._id;
};

// Register a new agent
exports.registerAgent = async (req, res, next) => {
  try {
    console.log('DEBUG - UserController - Agent registration attempt:', req.body.email);
    
    const { firstName, lastName, email, phone, password, referralCode, address, city, state, country } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Validate referral code if provided
    let referredBy = null;
    try {
      referredBy = await validateReferralCode(referralCode);
    } catch (err) {
      console.error('DEBUG - UserController - Referral code validation error:', err);
      throw err;
    }

    // Create new user with explicit password field
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password, // This will be hashed by the pre-save middleware
      userType: 'agent',
      level: 1,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy,
      personalSalesVolume: 0,
      teamSalesVolume: 0,
      personalSalesCount: 0,
      teamSalesCount: 0,
      address,
      city,
      state,
      country
    });

    // Verify password was hashed
    if (!user.password || user.password === password) {
      console.error('DEBUG - UserController - Password not hashed properly:', {
        userId: user._id,
        email: user.email
      });
      throw new AppError('Error creating user account', 500);
    }

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        level: user.level,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        personalSalesVolume: user.personalSalesVolume,
        teamSalesVolume: user.teamSalesVolume,
        personalSalesCount: user.personalSalesCount,
        teamSalesCount: user.teamSalesCount,
        token
      }
    });
  } catch (err) {
    console.error('DEBUG - UserController - Registration error:', err);
    next(err);
  }
};

// Register a new company
exports.registerCompany = async (req, res, next) => {
  try {
    console.log('DEBUG - UserController - Company registration attempt:', req.body.email);
    
    const { firstName, lastName, email, phone, password, companyName, address, city, state, country, licenseNumber, referralCode } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !companyName || !address || !city || !state || !country || !licenseNumber) {
      throw new AppError('Please provide all required fields for company registration', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate phone format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      throw new AppError('Invalid phone number format', 400);
    }

    // Validate password strength
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    // Check if user or company already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { companyName },
        { licenseNumber }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('User with this email already exists', 409);
      }
      if (existingUser.companyName === companyName) {
        throw new AppError('Company with this name already exists', 409);
      }
      if (existingUser.licenseNumber === licenseNumber) {
        throw new AppError('Company with this license number already exists', 409);
      }
    }

    // Validate referral code if provided
    let referredBy = null;
    try {
      referredBy = await validateReferralCode(referralCode);
    } catch (err) {
      console.error('DEBUG - UserController - Referral code validation error:', err);
      throw err;
    }

    // Create new company user with explicit password field
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password, // This will be hashed by the pre-save middleware
      userType: 'company',
      companyName,
      address,
      city,
      state,
      country,
      licenseNumber,
      level: 1,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy,
      personalSalesVolume: 0,
      teamSalesVolume: 0,
      personalSalesCount: 0,
      teamSalesCount: 0
    });

    // Verify password was hashed
    if (!user.password || user.password === password) {
      console.error('DEBUG - UserController - Password not hashed properly:', {
        userId: user._id,
        email: user.email
      });
      throw new AppError('Error creating company account', 500);
    }

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        companyName: user.companyName,
        address: user.address,
        licenseNumber: user.licenseNumber,
        level: user.level,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        personalSalesVolume: user.personalSalesVolume,
        teamSalesVolume: user.teamSalesVolume,
        personalSalesCount: user.personalSalesCount,
        teamSalesCount: user.teamSalesCount,
        token
      }
    });
  } catch (err) {
    console.error('DEBUG - UserController - Company registration error:', err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    console.log('DEBUG - UserController - Login attempt for:', email);

    // Find user and select required fields including password
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists
    if (!user) {
      console.log('DEBUG - UserController - User not found:', email);
      throw new AppError('Invalid email or password', 401);
    }

    // Log user data for debugging (excluding password)
    console.log('DEBUG - UserController - Found user:', {
      id: user._id,
      email: user.email,
      userType: user.userType,
      hasPassword: !!user.password
    });

    // Verify password
    try {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        console.log('DEBUG - UserController - Password mismatch for user:', email);
        throw new AppError('Invalid email or password', 401);
      }
    } catch (error) {
      console.error('DEBUG - UserController - Password verification error:', {
        error: error.message,
        userId: user._id,
        email: user.email
      });
      throw new AppError('Invalid email or password', 401);
    }

    // Validate required fields
    if (!user.firstName || !user.lastName || !user.phone) {
      console.error('DEBUG - UserController - Incomplete user profile:', {
        userId: user._id,
        email: user.email,
        hasFirstName: !!user.firstName,
        hasLastName: !!user.lastName,
        hasPhone: !!user.phone
      });
      throw new AppError('User profile is incomplete. Please contact support.', 400);
    }

    // If user has no type, set it to 'agent' by default
    if (!user.userType) {
      console.log('DEBUG - UserController - Setting default user type to agent');
      user.userType = 'agent';
      await user.save();
    }

    // Generate token
    const token = generateToken(user);

    // Return user data without password
    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        companyName: user.companyName || '',
        address: user.address || '',
        licenseNumber: user.licenseNumber || '',
        level: user.level,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        personalSalesVolume: user.personalSalesVolume,
        teamSalesVolume: user.teamSalesVolume,
        personalSalesCount: user.personalSalesCount,
        teamSalesCount: user.teamSalesCount,
        bankName: user.bankName || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || '',
        panNumber: user.panNumber || '',
        aadharNumber: user.aadharNumber || '',
        experience: user.experience || 0,
        specialization: user.specialization || '',
        languages: user.languages || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        alternatePhone: user.alternatePhone || '',
        bloodGroup: user.bloodGroup || '',
        streetAddress: user.streetAddress || '',
        landmark: user.landmark || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        country: user.country || 'India',
        documents: user.documents || {},
        token
      }
    });
  } catch (err) {
    console.error('DEBUG - UserController - Login error:', {
      error: err.message,
      statusCode: err.statusCode,
      stack: err.stack
    });
    next(err);
  }
};

// Get current logged in user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+userType');

    if (!user || !user.userType) {
      return next(new AppError('Invalid or missing userType for the user.', 401));
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (err) {
    next(err);
  }
};

// Update current user profile
exports.updateMe = async (req, res, next) => {
  try {
    console.log('DEBUG - UserController - Update request body:', req.body);
    console.log('DEBUG - UserController - Update request files:', req.files);


    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }

    // 2) Filter out unwanted fields names that are not allowed to be updated
    const updateData = filterObj(
      req.body,
      'firstName',
      'lastName',
      'phone',
      'companyName',
      'address',
      'licenseNumber',
      'dateOfBirth',
      'gender',
      'alternatePhone',
      'bloodGroup',
      'streetAddress',
      'landmark',
      'city',
      'state',
      'pincode',
      'country',
      'holderName',
      'bankName',
      'accountNumber',
      'ifscCode',
      'panNumber',
      'aadharNumber'
    );
    
    // Handle file uploads for KYC documents by setting them directly in the update object using dot notation
    if (req.files) {
      if (req.files.panCard) {
        updateData['documents.panCard'] = req.files.panCard[0].path;
      }
      if (req.files.aadharCardFront) {
        updateData['documents.aadharCardFront'] = req.files.aadharCardFront[0].path;
      }
      if (req.files.aadharCardBack) {
        updateData['documents.aadharCardBack'] = req.files.aadharCardBack[0].path;
      }
      console.log('DEBUG - UserController - Update data with documents:', updateData);
    }

    // 3) Update user document
    // Using dot notation in updateData will update nested fields without overwriting the whole object
    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    });

    console.log('DEBUG - UserController - User updated successfully:', updatedUser);

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    console.error('DEBUG - UserController - Update error:', err);
    next(err);
  }
};

// Delete current user (soft delete or actual delete)
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(204).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

// Admin functions
// Get all users
exports.getUsers = async (req, res, next) => {
  try {
    let query = {};
    
    // If user is a company, only return agents
    if (req.user.userType === 'company') {
      query.userType = 'agent';
    }
    
    const users = await User.find(query).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// Get single user
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(204).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

// Update user type
exports.updateUserType = async (req, res, next) => {
  try {
    const { email, userType } = req.body;
    
    if (!email || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and userType are required' 
      });
    }

    if (!['agent', 'company', 'admin'].includes(userType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user type. Must be one of: agent, company, admin' 
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { userType },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // If user is a company, ensure required fields are set
    if (userType === 'company' && (!user.companyName || !user.address || !user.licenseNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Company users require companyName, address, and licenseNumber fields'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('DEBUG - UserController - Error updating user type:', err);
    next(err);
  }
};

// Set user type for existing users
exports.setUserType = async (req, res, next) => {
  try {
    const { email, userType } = req.body;
    
    if (!email || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and userType are required' 
      });
    }

    if (!['agent', 'company', 'admin'].includes(userType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user type. Must be one of: agent, company, admin' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // If user already has a type, don't allow changing it
    if (user.userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already has a type set' 
      });
    }

    // Update the user type
    user.userType = userType;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User type set successfully',
      data: {
        email: user.email,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error('DEBUG - UserController - Error setting user type:', err);
    next(err);
  }
};

// Get all agents with optional filters for city, state, country
exports.getAllAgents = async (req, res, next) => {
  try {
    const { city, state, country } = req.query;
    const filter = { userType: 'agent' };
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (country) filter.country = new RegExp(country, 'i');

    const agents = await User.find(filter).select('firstName lastName email phone city state country address');
    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (err) {
    next(err);
  }
};

// Get top agents ordered by personalSalesCount (descending)
exports.getTopAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ userType: 'agent' })
      .select('firstName lastName email phone city state country address personalSalesCount')
      .sort({ personalSalesCount: -1 })
      .limit(100);
    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (err) {
    next(err);
  }
};

// Get all companies with optional filters for city, state, country
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { city, state, country } = req.query;
    const filter = { userType: 'company' };
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (country) filter.country = new RegExp(country, 'i');

    const companies = await User.find(filter).select('companyName email phone address city state country licenseNumber');
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (err) {
    next(err);
  }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // For security, do not reveal if the email exists
      return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
    }
    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 15; // 15 minutes
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    // Send email
    await sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Hello,</p><p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`
    });
    return res.status(200).json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
}; 