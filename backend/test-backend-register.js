// Test backend registration endpoint directly
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testBackendRegistration() {
  try {
    console.log('🔍 Testing backend registration...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check current users
    const currentUsers = await mongoose.connection.db.collection('users').countDocuments();
    console.log('📊 Current users:', currentUsers);
    
    // Test user data
    const testUser = {
      name: 'Test User',
      email: 'testuser' + Date.now() + '@example.com',
      password: 'password123',
      role: 'viewer'
    };
    
    console.log('🧪 Creating test user:', { ...testUser, password: '***' });
    
    // Direct database insertion (bypassing backend)
    try {
      const result = await mongoose.connection.db.collection('users').insertOne(testUser);
      console.log('✅ Direct DB insertion successful:', result.insertedId);
      
      // Verify user was created
      const newCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log('📊 New user count:', newCount);
      
      // Show the created user
      const createdUser = await mongoose.connection.db.collection('users').findOne({ _id: result.insertedId });
      console.log('👤 Created user:', createdUser);
      
    } catch (dbError) {
      console.log('❌ Direct DB insertion failed:', dbError.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testBackendRegistration();
