const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  merchantAddress: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  payerAddress: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  tokenAddress: {
    type: String,
    required: true,
    trim: true
  },
  grossAmount: {
    type: String,
    required: true // Store as string to handle big numbers
  },
  netAmount: {
    type: String,
    required: true
  },
  feeAmount: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  blockNumber: {
    type: Number,
    index: true
  },
  blockHash: {
    type: String
  },
  gasUsed: {
    type: String
  },
  gasPrice: {
    type: String
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  paymentId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
transactionSchema.index({ merchantAddress: 1, timestamp: -1 });
transactionSchema.index({ payerAddress: 1, timestamp: -1 });
transactionSchema.index({ tokenAddress: 1, timestamp: -1 });
transactionSchema.index({ status: 1, timestamp: -1 });
transactionSchema.index({ blockNumber: 1 });

// Virtual for formatted amounts
transactionSchema.virtual('formattedGrossAmount').get(function() {
  return (parseFloat(this.grossAmount) / 1000000).toFixed(6); // Convert from wei to USDC/USDT
});

transactionSchema.virtual('formattedNetAmount').get(function() {
  return (parseFloat(this.netAmount) / 1000000).toFixed(6);
});

transactionSchema.virtual('formattedFeeAmount').get(function() {
  return (parseFloat(this.feeAmount) / 1000000).toFixed(6);
});

// Virtual for fee percentage
transactionSchema.virtual('feePercentage').get(function() {
  const gross = parseFloat(this.grossAmount);
  const fee = parseFloat(this.feeAmount);
  return gross > 0 ? ((fee / gross) * 100).toFixed(2) : 0;
});

// Instance methods
transactionSchema.methods.markCompleted = function(blockNumber, blockHash) {
  this.status = 'completed';
  this.blockNumber = blockNumber;
  this.blockHash = blockHash;
  return this.save();
};

transactionSchema.methods.markFailed = function() {
  this.status = 'failed';
  return this.save();
};

// Static methods
transactionSchema.statics.findByHash = function(transactionHash) {
  return this.findOne({ transactionHash });
};

transactionSchema.statics.findByPaymentId = function(paymentId) {
  return this.findOne({ paymentId });
};

transactionSchema.statics.findByMerchant = function(merchantAddress, options = {}) {
  const { page = 1, limit = 10, status } = options;
  const query = { merchantAddress: merchantAddress.toLowerCase() };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('merchantAddress', 'name');
};

transactionSchema.statics.getDailyStats = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate }, status: 'completed' } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        revenue: { $sum: { $toDouble: "$netAmount" } },
        fees: { $sum: { $toDouble: "$feeAmount" } },
        transactions: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

transactionSchema.statics.getTokenStats = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate }, status: 'completed' } },
    {
      $group: {
        _id: "$tokenAddress",
        volume: { $sum: { $toDouble: "$grossAmount" } },
        transactions: { $sum: 1 },
        fees: { $sum: { $toDouble: "$feeAmount" } }
      }
    },
    { $sort: { volume: -1 } }
  ]);
};

transactionSchema.statics.getTotalStats = function() {
  return this.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $toDouble: "$netAmount" } },
        totalFees: { $sum: { $toDouble: "$feeAmount" } },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: { $toDouble: "$grossAmount" } }
      }
    }
  ]);
};

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  if (this.isModified('merchantAddress')) {
    this.merchantAddress = this.merchantAddress.toLowerCase();
  }
  if (this.isModified('payerAddress')) {
    this.payerAddress = this.payerAddress.toLowerCase();
  }
  if (this.isModified('tokenAddress')) {
    this.tokenAddress = this.tokenAddress.toLowerCase();
  }
  if (this.isModified('transactionHash')) {
    this.transactionHash = this.transactionHash.toLowerCase();
  }
  next();
});

// Ensure virtual fields are serialized
transactionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
