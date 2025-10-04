const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide lead name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide lead email'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide lead phone number'],
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'hot', 'warm', 'cold', 'closed', 'contacted', 'qualified', 'proposal', 'negotiation', 'lost'],
    default: 'new'
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'other'],
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  notes: {
    type: String,
    trim: true
  },
  lastContacted: {
    type: Date,
    default: Date.now
  },
  reminder: {
    date: Date,
    message: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isTransferred: {
    type: Boolean,
    default: false,
  },
  transferredTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.isTransferred; }
  },
  transferHistory: [
    {
      transferredTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      transferredAt: {
        type: Date,
        default: Date.now,
      },
      commissionSplit: {
        type: {
          type: String,
          enum: ['ratio', 'custom'],
        },
        value: {
          type: String,
        },
      },
      transferredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
  commissionSplit: {
    type: {
      type: String,
      enum: ['ratio', 'custom'],
    },
    value: {
      type: String,
    },
  },
  sellingPrice: {
    type: Number,
    min: 0,
    required: function() { return this.status === 'Closed'; }
  },
  buyerName: {
    type: String,
    trim: true,
    required: function() { return this.status === 'Closed'; }
  },
}, {
  timestamps: true
});

// Index for better search performance
leadSchema.index({ email: 1, phone: 1 });
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ 'reminder.createdBy': 1 });
leadSchema.index({ createdBy: 1 });
leadSchema.index({ isTransferred: 1 });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead; 