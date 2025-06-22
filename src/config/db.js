const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * MongoDB connection URI
 * Uses environment variable or default localhost URI
 */
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:5000/task_pro';

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI, {
      // These options are no longer needed in mongoose 6+
      // but included for compatibility with older versions
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
