// Debug Authentication Issues
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');
    
    // Test User model
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { collection: 'users' }));
    
    // Test user lookup
    console.log('🔍 Testing user lookup...');
    const testUser = await User.findOne({ email: 'buvanese23@gmail.com' }).select('+password');
    console.log('👤 Test user result:', testUser ? 'Found' : 'Not found');
    
    // Test password comparison
    if (testUser) {
      const bcrypt = await import('bcryptjs');
      const isMatch = await bcrypt.compare('buvanes', testUser.password);
      console.log('🔐 Password match:', isMatch);
    }
    
    // Test all users
    const allUsers = await User.find({});
    console.log('👥 All users count:', allUsers.length);
    
    console.log('✅ Authentication debug complete');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

debugAuth();
