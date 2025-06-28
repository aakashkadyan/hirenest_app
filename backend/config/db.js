const mongoose = require("mongoose");
require('dotenv').config();

// Handle initial connection errors better
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  
});

mongoose.connection.once('open', () => {
  console.log('MongoDB connection established successfully');
});

const connectDB = async () => {
  try {
    // Use mongoose for the main connection with more robust options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 60000, // Increased timeout for server selection (60 seconds)
      socketTimeoutMS: 120000,         // Increased socket timeout (2 minutes)
      connectTimeoutMS: 60000,         // Connection timeout (60 seconds)
      family: 4,                       // Force IPv4
      maxPoolSize: 10,                 // Connection pool size
      minPoolSize: 5,                  // Minimum connections maintained
      retryWrites: true,               // Retry write operations if they fail
      heartbeatFrequencyMS: 5000,      // Check connection health more frequently
    });
    
    console.log(`MongoDB Connected to: ${conn.connection.host}, Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    
    // Provide more helpful error messages based on common error types
    if (error.name === 'MongooseServerSelectionError') {
      if (error.message.includes('IP that isn\'t whitelisted')) {
        console.error('\n⚠️ IP WHITELIST ERROR: Your current IP address is not whitelisted in MongoDB Atlas.');
        console.error('Please add your IP address in MongoDB Atlas > Network Access > Add IP Address');
        console.error('URL: https://cloud.mongodb.com/v2/account > Security > Network Access\n');
      } else if (error.message.includes('timed out')) {
        console.error('\n⚠️ CONNECTION TIMEOUT: Could not reach MongoDB Atlas servers. Check your internet connection.');
      }
    } else if (error.name === 'MongoNetworkError') {
      console.error('\n⚠️ NETWORK ERROR: Could not connect to MongoDB Atlas. Check your network connectivity.');
    } else if (error.message.includes('Authentication failed')) {
      console.error('\n⚠️ AUTHENTICATION ERROR: Username or password is incorrect in your MONGO_URI.');
    }
    
    throw error;
  }
};

process.on('SIGINT', async () => {
  try {
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('Mongoose connection closed through app termination');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

module.exports = connectDB;
