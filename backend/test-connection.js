+import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('Testing MongoDB Connection...');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'NOT SET');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('  Name:', error.name);
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

testConnection();
