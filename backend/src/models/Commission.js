const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ['personal', 'team_override', 'team_split', 'company_bonus'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for better search performance
commissionSchema.index({ agent: 1, status: 1 });
commissionSchema.index({ property: 1 });
commissionSchema.index({ company: 1 });

const Commission = mongoose.model('Commission', commissionSchema);

module.exports = Commission; 