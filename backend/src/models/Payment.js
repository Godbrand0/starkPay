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
  },
  tokenAddress: {
    type: String,
    required: true,
  },
  amount: {
    type: String,
    required: true,
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
    enum: ['pending', 'completed', 'expired'],
    default: 'pending',
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