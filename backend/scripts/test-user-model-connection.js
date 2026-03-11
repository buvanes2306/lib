// Test User Model Database Connection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testUserModelConnection() {
  try {
    console.log('🔍 Testing User Model Database Connection...');
    
    // Connect to database using the same URI as backend
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database:', process.env.MONGODB_URI);
    
    // Check current database
    console.log('📁 Current database:', mongoose.connection.name);
    
    // Test raw collection access
    const usersCollection = mongoose.connection.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('👥 Users in collection:', userCount);
    
    // Test User model import
    try {
      const User = await import('../models/User.js');
      console.log('✅ User model imported successfully');
      
      // Test User model query
      const user = await User.default.findOne({ email: 'buvanese23@gmail.com' });
      console.log('👤 User found with model:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('📧 User email:', user.email);
        console.log('👤 User name:', user.name);
        
        // Test findById
        const foundUser = await User.default.findById(user._id);
        console.log('👤 User.findById result:', foundUser ? 'Found' : 'Not found');
        
        if (foundUser) {
          console.log('📧 Found user email:', foundUser.email);
        }
      }
      
    } catch (modelError) {
      console.error('❌ User model error:', modelError.message);
      console.error('Stack:', modelError.stack);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testUserModelConnection();
