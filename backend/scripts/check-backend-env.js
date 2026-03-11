// Check Backend Environment Variables
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking Backend Environment Variables...');
console.log('📁 MONGODB_URI:', process.env.MONGODB_URI);
console.log('🔐 JWT_SECRET:', process.env.JWT_SECRET);
console.log('🌐 PORT:', process.env.PORT);
console.log('🏠 NODE_ENV:', process.env.NODE_ENV);

// Test if the URI is for local MongoDB
const isLocalMongo = process.env.MONGODB_URI.includes('localhost:27017');
console.log('🏠 Using local MongoDB:', isLocalMongo ? 'Yes' : 'No');

if (!isLocalMongo) {
  console.log('❌ Backend is trying to connect to MongoDB Atlas instead of local MongoDB');
  console.log('🔧 Fix: Update .env file to use local MongoDB URI');
} else {
  console.log('✅ Backend is configured to use local MongoDB');
}
