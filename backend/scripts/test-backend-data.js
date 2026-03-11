// Test Backend Data Access
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import the actual models
import User from '../models/User.js';

async function testBackendData() {
  try {
    console.log('🔍 Testing backend data access...');
    
    // Connect using the same URI as backend
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to librarydb');
    
    // Test User model
    console.log('🔍 Testing User model...');
    const user = await User.findOne({ email: 'buvanese23@gmail.com' }).select('+password');
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('📧 Email:', user.email);
      console.log('👤 Name:', user.name);
      console.log('👑 Role:', user.role);
      console.log('🔐 Has password:', user.password ? 'Yes' : 'No');
      
      // Test password comparison
      const isMatch = await user.comparePassword('buvanes');
      console.log('🔐 Password match:', isMatch);
    }
    
    // Test raw collection access
    console.log('\n🔍 Testing raw collection access...');
    const usersCollection = mongoose.connection.collection('users');
    const rawUser = await usersCollection.findOne({ email: 'buvanese23@gmail.com' });
    console.log('👤 Raw user found:', rawUser ? 'Yes' : 'No');
    
    // Test books collection
    const booksCollection = mongoose.connection.collection('books');
    const bookCount = await booksCollection.countDocuments();
    console.log('📚 Books count:', bookCount);
    
    console.log('\n✅ Backend data access test complete');
    
  } catch (error) {
    console.error('❌ Backend data access error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testBackendData();
