// Test Auth Controller Directly
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import User model directly
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function testAuthDirectly() {
  try {
    console.log('🔍 Testing auth controller directly...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test user lookup (same as authController line 56)
    console.log('🔍 Testing user lookup...');
    const user = await User.findOne({ email: 'buvanese23@gmail.com' }).select('+password');
    console.log('👤 User lookup result:', user ? 'Found' : 'Not found');
    
    if (user) {
      console.log('📧 User email:', user.email);
      console.log('👤 User name:', user.name);
      console.log('🔐 Has password:', user.password ? 'Yes' : 'No');
      console.log('👑 User role:', user.role);
    }
    
    // Test password comparison
    if (user) {
      const bcrypt = await import('bcryptjs');
      const isMatch = await bcrypt.compare('buvanes', user.password);
      console.log('🔐 Password match:', isMatch);
    }
    
    console.log('✅ Auth test complete');
    
  } catch (error) {
    console.error('❌ Auth test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testAuthDirectly();
