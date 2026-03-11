import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const verifyMongoDB = async () => {
  try {
    console.log('🔍 Verifying MongoDB Connection...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log('📊 Database Name:', db.databaseName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    // Check books collection
    if (collections.some(c => c.name === 'books')) {
      const booksCollection = db.collection('books');
      const booksCount = await booksCollection.countDocuments();
      console.log('📚 Books collection documents:', booksCount);
      
      // Get sample books
      const sampleBooks = await booksCollection.find({}).limit(3).toArray();
      console.log('📖 Sample books:');
      sampleBooks.forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title} (${book.accNo}) - ${book.status}`);
      });
      
      // Check fields
      if (sampleBooks.length > 0) {
        console.log('🏷️  Book fields:', Object.keys(sampleBooks[0]));
      }
    } else {
      console.log('❌ No books collection found');
    }
    
    // Check users collection
    if (collections.some(c => c.name === 'users')) {
      const usersCollection = db.collection('users');
      const usersCount = await usersCollection.countDocuments();
      console.log('👥 Users collection documents:', usersCount);
    }
    
  } catch (error) {
    console.error('❌ MongoDB verification failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

verifyMongoDB();
