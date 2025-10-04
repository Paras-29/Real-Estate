const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    enum: ['agent', 'company', 'admin'],
    default: 'agent',
    select : true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  },
  alternatePhone: {
    type: String,
    trim: true,
  },
  streetAddress: {
    type: String,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: props => `${props.value} is not a valid pincode! Must be 6 digits.`
    }
  },
  country: {
    type: String,
    trim: true,
    default: 'India'
  },
  companyName: {
    type: String,
    required: function() { return this.userType === 'company'; }
  },
  address: {
    type: String,
    required: function() { return this.userType === 'company'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.userType === 'company'; }
  },
  bio: {
    type: String,
    trim: true
  },
  languages: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: 0
  },
  specialization: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'land', 'luxury', 'rental']
  },
  bankName: {
    type: String,
    trim: true
  },
  holderName: {
    type: String,
    trim: true
  },
  accountNumber: {
    type: String,
    trim: true
  },
  ifscCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  panNumber: {
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: props => `${props.value} is not a valid PAN number!`
    }
  },
  aadharNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid Aadhar number! Must be 12 digits.`
    }
  },
  documents: {
    panCard: {
      type: String, // Base64 string of the PAN card document
    },
    aadharCardFront: {
      type: String, // Base64 string of the Aadhar card front
    },
    aadharCardBack: {
      type: String, // Base64 string of the Aadhar card back
    },
    licenseDocument: {
      type: String, // Base64 string of the license document
    }
  },
  level: {
    type: Number,
    default: 1,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  personalSalesVolume: {
    type: Number,
    default: 0,
  },
  teamSalesVolume: {
    type: Number,
    default: 0,
  },
  personalSalesCount: {
    type: Number,
    default: 0,
  },
  teamSalesCount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // Password reset fields
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
      return next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    
    // Set the hashed password
    this.password = hashedPassword;
    
    // Log successful password hashing
    console.log('DEBUG - UserModel - Password hashed successfully for user:', {
      id: this._id,
      email: this.email
    });
    
    next();
  } catch (error) {
    console.error('DEBUG - UserModel - Error hashing password:', {
      error: error.message,
      userId: this._id,
      email: this.email
    });
    next(error);
  }
});

// Validate user type and required fields before saving
UserSchema.pre('validate', function(next) {
  try {
    console.log('DEBUG - UserModel - Validating user:', {
      id: this._id,
      email: this.email,
      userType: this.userType,
      isNew: this.isNew
    });

    // If this is a new user, ensure userType is set
    if (this.isNew && !this.userType) {
      console.error('DEBUG - UserModel - New user without userType:', {
        id: this._id,
        email: this.email
      });
      // It's better to throw an error here to prevent saving invalid user
      const error = new Error('User type is required for new users.');
      error.name = 'ValidationError';
      throw error;
    }

    // Validate required fields for company userType
    if (this.userType === 'company') {
      const companyRequiredFields = ['companyName', 'address', 'licenseNumber'];
      const missingCompanyFields = companyRequiredFields.filter(field => !this[field]);
      if (missingCompanyFields.length > 0) {
        const error = new Error(`Missing required fields for company: ${missingCompanyFields.join(', ')}`);
        error.name = 'ValidationError';
        throw error;
      }
    }

    next();
  } catch (error) {
    console.error('DEBUG - UserModel - Error during pre-validate hook:', {
      error: error.message,
      userId: this._id,
      email: this.email
    });
    next(error);
  }
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('DEBUG - UserModel - Comparing password for user:', {
      userId: this._id,
      email: this.email,
      hasStoredPassword: !!this.password
    });

    if (!this.password) {
      console.error('DEBUG - UserModel - No stored password found for user:', {
        userId: this._id,
        email: this.email
      });
      throw new Error('No stored password found');
    }

    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    
    console.log('DEBUG - UserModel - Password comparison result:', {
      userId: this._id,
      email: this.email,
      isMatch
    });

    return isMatch;
  } catch (error) {
    console.error('DEBUG - UserModel - Password comparison error:', {
      error: error.message,
      userId: this._id,
      email: this.email
    });
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema); 