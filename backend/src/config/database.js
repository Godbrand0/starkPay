

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://thompsoneregha005_db_user:pXIRJpZvSp6xVgDg@cluster0.ktxh2dc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;