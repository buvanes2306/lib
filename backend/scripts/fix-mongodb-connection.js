// MongoDB Atlas Connection Fix
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Test user count
    const usersCount = await db.collection('users').countDocuments();
    console.log('👥 Users in database:', usersCount);
    
    // Test book count
    const booksCount = await db.collection('books').countDocuments();
    console.log('📚 Books in database:', booksCount);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.message.includes('IP that isn\'t whitelisted')) {
      console.log('\n🔧 SOLUTION: IP Whitelisting Required');
      console.log('1. Go to MongoDB Atlas: https://cloud.mongodb.com/');
      console.log('2. Select your cluster');
      console.log('3. Go to Network Access');
      console.log('4. Add your current IP address');
      console.log('5. Wait 2-3 minutes for changes to apply');
      console.log('\n🌐 Alternative: Use 0.0.0.0/0 (less secure)');
      console.log('Add IP: 0.0.0.0/0 to allow all IPs (for development only)');
    }
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();
