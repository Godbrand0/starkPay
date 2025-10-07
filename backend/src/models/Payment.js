const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
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
  tokenAddress: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  // Currency conversion fields
  usdAmount: {
    type: Number,
  },
  ngnAmount: {
    type: Number,
  },
  selectedCurrency: {
    type: String,
    enum: ['USD', 'NGN', 'STRK'],
  },
  exchangeRate: {
    type: Number, // STRK/USD rate at time of QR generation
  },
  rateTimestamp: {
    type: Date,
  },
  description: {
    type: String,
  },
  qrCode: {
    type: String, // base64 encoded QR code
  },
  paymentUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending',
  },
  // Transaction details (filled when payment is completed)
  transactionHash: {
    type: String,
    sparse: true, // Allow multiple null values
  },
  payerAddress: {
    type: String,
  },
  grossAmount: {
    type: String,
  },
  netAmount: {
    type: String,
  },
  feeAmount: {
    type: String,
  },
  blockNumber: {
    type: Number,
  },
  completedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);