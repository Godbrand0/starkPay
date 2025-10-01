const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  email: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  transactionCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
merchantSchema.index({ email: 1 }, { sparse: true });
merchantSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Merchant', merchantSchema);