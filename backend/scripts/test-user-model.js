// Test User Model Directly
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import the actual User model
import User from '../models/User.js';

async function testUserModel() {
  try {
    console.log('🔍 Testing User model...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test user lookup
    console.log('🔍 Looking up user...');
    const user = await User.findOne({ email: 'buvanese23@gmail.com' }).select('+password');
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('🔐 Has password:', user.password ? 'Yes' : 'No');
      console.log('👑 Role:', user.role);
      
      // Test comparePassword method
      console.log('🔍 Testing comparePassword method...');
      try {
        const isMatch = await user.comparePassword('buvanes');
        console.log('🔐 Password match:', isMatch);
      } catch (error) {
        console.error('❌ comparePassword error:', error.message);
      }
    }
    
    console.log('✅ User model test complete');
    
  } catch (error) {
    console.error('❌ User model test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testUserModel();
