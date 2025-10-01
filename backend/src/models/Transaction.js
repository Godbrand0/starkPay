const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  merchantAddress: {
    type: String,
    required: true,
    index: true,
  },
  payerAddress: {
    type: String,
    required: true,
  },
  tokenAddress: {
    type: String,
    required: true,
  },
  grossAmount: {
    type: String,
    required: true,
  },
  netAmount: {
    type: String,
    required: true,
  },
  feeAmount: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  blockNumber: {
    type: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
transactionSchema.index({ merchantAddress: 1, timestamp: -1 });
transactionSchema.index({ payerAddress: 1, timestamp: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);