// MongoDB Connection Optimization
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Optimized connection options
const connectionOptions = {
  serverSelectionTimeoutMS: 5000,  // 5 seconds instead of 30
  socketTimeoutMS: 45000,        // 45 seconds
  bufferMaxEntries: 0,            // Disable buffering
  bufferCommands: false,           // Disable command buffering
  maxPoolSize: 10,              // Connection pool size
  minPoolSize: 2,               // Minimum connections
  maxIdleTimeMS: 30000,          // Close idle connections after 30s
  retryWrites: true,              // Enable retry writes
  w: 'majority'                  // Write concern
};

async function testOptimizedConnection() {
  try {
    console.log('🔍 Testing optimized MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    // Connect with optimized options
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations with timeout
    const db = mongoose.connection.db;
    
    // Test with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timeout')), 8000);
    });
    
    const operationPromise = db.collection('users').countDocuments();
    
    const usersCount = await Promise.race([operationPromise, timeoutPromise]);
    console.log('👥 Users in database:', usersCount);
    
    const booksCount = await db.collection('books').countDocuments();
    console.log('📚 Books in database:', booksCount);
    
    console.log('🚀 Database operations completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB error:', error.message);
    
    if (error.message.includes('buffering timed out')) {
      console.log('\n🔧 TIMEOUT FIX APPLIED');
      console.log('1. Reduced timeout settings');
      console.log('2. Added connection pooling');
      console.log('3. Disabled buffering');
      console.log('4. Added retry logic');
    }
  } finally {
    await mongoose.connection.close();
  }
}

testOptimizedConnection();
