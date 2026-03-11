// Test Local MongoDB Service
import mongoose from 'mongoose';

async function testLocalMongoDBService() {
  try {
    console.log('🔍 Testing Local MongoDB Service...');
    
    // Test connection to local MongoDB
    await mongoose.connect('mongodb://localhost:27017');
    console.log('✅ Connected to local MongoDB server');
    
    // List databases
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    
    console.log('📁 Available databases:');
    if (databases && databases.databases) {
      databases.databases.forEach(db => {
        console.log(`  - ${db.name}`);
      });
    }
    
    // Test librarydb connection
    const libraryDb = mongoose.connection.useDb('librarydb');
    const collections = await libraryDb.listCollections();
    
    console.log('\n📚 Collections in librarydb:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Test user collection
    const userCount = await libraryDb.collection('users').countDocuments();
    console.log(`\n👥 Users in librarydb: ${userCount}`);
    
    console.log('\n✅ Local MongoDB service is working correctly');
    
  } catch (error) {
    console.error('❌ Local MongoDB service error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 SOLUTION: Start MongoDB service');
      console.log('1. Make sure MongoDB is installed');
      console.log('2. Start MongoDB service:');
      console.log('   - Windows: net start MongoDB');
      console.log('   - Or use MongoDB Compass to start service');
      console.log('3. Check if MongoDB is running on port 27017');
    }
  } finally {
    await mongoose.connection.close();
  }
}

testLocalMongoDBService();
