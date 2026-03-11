// Test /api/auth/me endpoint
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testAuthMeEndpoint() {
  try {
    console.log('🔍 Testing /api/auth/me endpoint...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test User model
    const User = mongoose.model('User', new mongoose.Schema({}, { collection: 'users' }));
    
    // Find user
    const user = await User.findOne({ email: 'buvanese23@gmail.com' });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (user) {
      // Generate token
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign({ id: user._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
      console.log('🔐 Generated token:', token.substring(0, 30) + '...');
      
      // Test the endpoint with token
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Cookie': `token=${token}`
        }
      });
      
      const text = await response.text();
      console.log('📥 Response status:', response.status);
      console.log('📥 Response text:', text);
      
      if (response.ok) {
        console.log('✅ /api/auth/me endpoint working!');
      } else {
        console.log('❌ /api/auth/me endpoint failed');
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testAuthMeEndpoint();
