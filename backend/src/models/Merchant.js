const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  transactionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastTransactionAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
merchantSchema.index({ email: 1 }, { sparse: true });
merchantSchema.index({ createdAt: -1 });
merchantSchema.index({ totalEarnings: -1 });
merchantSchema.index({ transactionCount: -1 });

// Virtual for formatted earnings
merchantSchema.virtual('formattedEarnings').get(function() {
  return (this.totalEarnings / 1000000).toFixed(6); // Convert from wei to USDC/USDT
});

// Instance methods
merchantSchema.methods.updateEarnings = function(amount) {
  this.totalEarnings += amount;
  this.transactionCount += 1;
  this.lastTransactionAt = new Date();
  return this.save();
};

// Static methods
merchantSchema.statics.findByAddress = function(address) {
  return this.findOne({ address: address.toLowerCase() });
};

merchantSchema.statics.getTopMerchants = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalEarnings: -1 })
    .limit(limit)
    .select('name address totalEarnings transactionCount');
};

merchantSchema.statics.getTotalStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalMerchants: { $sum: 1 },
        totalEarnings: { $sum: '$totalEarnings' },
        totalTransactions: { $sum: '$transactionCount' }
      }
    }
  ]);
};

// Pre-save middleware
merchantSchema.pre('save', function(next) {
  if (this.isModified('address')) {
    this.address = this.address.toLowerCase();
  }
  next();
});

// Ensure virtual fields are serialized
merchantSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Merchant', merchantSchema);
