require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const merchantRoutes = require('./routes/merchant');
const paymentRoutes = require('./routes/payment');
const priceRoutes = require('./routes/price');
const { checkPendingPayments, expireOldQRCodes } = require('./services/paymentVerificationService');
const { startCleanupService } = require('./services/cleanupService');

const app = express();
const PORT = process.env.PORT || 3004;

console.log('Starting server...');
console.log("i'm using the frontend url, ",process.env.CORS_ORIGIN)

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging with full URL details
app.use((req, res, next) => {
  console.log('\n========== INCOMING REQUEST ==========');
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log(`Origin: ${req.get('origin') || 'Not set'}`);
  console.log(`Referer: ${req.get('referer') || 'Not set'}`);
  console.log(`User-Agent: ${req.get('user-agent') || 'Not set'}`);
  console.log(`IP: ${req.ip}`);
  console.log(`Body:`, req.body);
  console.log(`Query:`, req.query);
  console.log('======================================\n');
  next();
});
console.log("i'm using the frontend url, ",process.env.CORS_ORIGIN)


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
console.log("i'm using the frontend url, ",process.env.CORS_ORIGIN)
app.use('/api/merchant', merchantRoutes);
console.log("i'm using the frontend url, ",process.env.CORS_ORIGIN)
app.use('/api/payment', paymentRoutes);
app.use('/api/price', priceRoutes);
console.log("i'm using the frontend url, ",process.env.CORS_ORIGIN)


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start cron job for payment verification (every 30 seconds)
cron.schedule('*/30 * * * * *', async () => {
  try {
    await checkPendingPayments();
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

console.log('⏰ Payment verification cron job started (runs every 30 seconds)');

// Start cleanup service for auto-expiring old pending payments
startCleanupService();

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});