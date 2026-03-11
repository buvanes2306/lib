import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabaseInfo() {
  try {
    console.log('🔍 Checking database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Check users collection
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log('\n👥 Users collection:', usersCount, 'documents');

    // Check books collection
    const booksCount = await mongoose.connection.db.collection('books').countDocuments();
    console.log('📚 Books collection:', booksCount, 'documents');

    // Show sample user if any exist
    if (usersCount > 0) {
      const sampleUser = await mongoose.connection.db.collection('users').findOne();
      console.log('\n👤 Sample user:', sampleUser);
    }

    // Show sample book if any exist
    if (booksCount > 0) {
      const sampleBook = await mongoose.connection.db.collection('books').findOne();
      console.log('\n📖 Sample book:', sampleBook.title);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkDatabaseInfo();
