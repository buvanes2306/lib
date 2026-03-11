// Debug Authentication Middleware
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function debugAuthMiddleware() {
  try {
    console.log('🔍 Debugging authentication middleware...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test user lookup
    const user = await User.findOne({ email: 'buvanese23@gmail.com' });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('📧 User email:', user.email);
      console.log('👤 User name:', user.name);
      console.log('👑 User role:', user.role);
      console.log('🆔 User ID:', user._id);
      
      // Test JWT generation
      const jwt = await import('jsonwebtoken');
      const token = jwt.default.sign({ id: user._id }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
      console.log('🔐 Generated token:', token.substring(0, 30) + '...');
      
      // Test JWT verification
      try {
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
        console.log('🔍 JWT decoded:', decoded);
        console.log('🆔 Decoded ID:', decoded.id);
        console.log('🆔 User ID:', user._id.toString());
        console.log('🔍 IDs match:', decoded.id === user._id.toString());
      } catch (jwtError) {
        console.error('❌ JWT verification error:', jwtError.message);
      }
      
      // Test User.findById with decoded ID
      try {
        const foundUser = await User.findById(user._id).select('-password');
        console.log('👤 User.findById result:', foundUser ? 'Found' : 'Not found');
        if (foundUser) {
          console.log('📧 Found user email:', foundUser.email);
          console.log('👤 Found user name:', foundUser.name);
        }
      } catch (findError) {
        console.error('❌ User.findById error:', findError.message);
        console.error('Stack:', findError.stack);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

debugAuthMiddleware();
