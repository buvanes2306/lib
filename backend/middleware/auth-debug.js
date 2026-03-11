import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    console.log('🔍 Auth middleware: Starting authentication...');
    
    const token = req.cookies.token;
    console.log('🍪 Token found:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    console.log('🔐 Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT verified, decoded:', decoded);
    
    console.log('👤 Looking up user by ID:', decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    console.log('👤 User lookup result:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    console.log('✅ Authentication successful for user:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('❌ Authentication error:', error.name);
    console.log('❌ Error message:', error.message);
    console.log('❌ Error stack:', error.stack);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};
