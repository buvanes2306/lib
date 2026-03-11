// Test Auth Controller User Model
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testAuthControllerModel() {
  try {
    console.log('🔍 Testing Auth Controller User Model...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Import the actual User model from authController
    try {
      const User = await import('../models/User.js');
      console.log('✅ User model imported successfully');
      
      // Test user lookup with the actual model
      const user = await User.default.findOne({ email: 'buvanese23@gmail.com' });
      console.log('👤 User found with actual model:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log('📧 User email:', user.email);
        console.log('👤 User name:', user.name);
        console.log('👑 User role:', user.role);
        console.log('🆔 User ID:', user._id);
        
        // Test findById with the actual model
        const foundUser = await User.default.findById(user._id).select('-password');
        console.log('👤 User.findById with actual model:', foundUser ? 'Found' : 'Not found');
        
        if (foundUser) {
          console.log('📧 Found user email:', foundUser.email);
          console.log('👤 Found user name:', foundUser.name);
        }
      }
      
    } catch (importError) {
      console.error('❌ User model import error:', importError.message);
      console.error('Stack:', importError.stack);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testAuthControllerModel();
