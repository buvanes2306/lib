// Check Local MongoDB Status
import mongoose from 'mongoose';

async function checkLocalMongoDB() {
  try {
    console.log('🔍 Checking local MongoDB...');
    
    // Connect to local MongoDB
    await mongoose.connect('mongodb://localhost:27017');
    console.log('✅ Connected to local MongoDB server');
    
    // List all databases
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    console.log('📁 Available databases:');
    if (databases && databases.databases) {
      databases.databases.forEach(db => {
        console.log(`  - ${db.name}`);
      });
    } else {
      console.log('  - No databases found');
    }
    
    // Check if librarydb exists
    const libraryDb = mongoose.connection.useDb('librarydb');
    const collections = await libraryDb.listCollections();
    console.log('\n📚 Collections in librarydb:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check if users collection exists and has data
    if (collections.some(c => c.name === 'users')) {
      const userCount = await libraryDb.collection('users').countDocuments();
      console.log(`\n👥 Users in database: ${userCount}`);
      
      if (userCount > 0) {
        const users = await libraryDb.collection('users').find({}).toArray();
        console.log('📋 User list:');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      }
    } else {
      console.log('\n❌ Users collection does not exist');
    }
    
    // Check if books collection exists
    if (collections.some(c => c.name === 'books')) {
      const bookCount = await libraryDb.collection('books').countDocuments();
      console.log(`\n📚 Books in database: ${bookCount}`);
    } else {
      console.log('\n❌ Books collection does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking local MongoDB:', error.message);
    
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

checkLocalMongoDB();
