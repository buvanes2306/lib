// Check current database state
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';

dotenv.config();

async function checkCurrentDB() {
  try {
    console.log('🔍 Checking current database state...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Use the actual Book model
    // Book is already imported at the top
    
    const totalBooks = await Book.countDocuments();
    console.log(`📊 Total books: ${totalBooks}`);
    
    if (totalBooks > 0) {
      const sampleBooks = await Book.find({}).limit(3);
      console.log('\n📋 Sample books:');
      sampleBooks.forEach((book, index) => {
        console.log(`\n  Book ${index + 1}:`);
        console.log(`    _id: ${book._id}`);
        console.log(`    bookId: ${book.bookId}`);
        console.log(`    accNo: ${book.accNo}`);
        console.log(`    title: ${book.title}`);
        console.log(`    department: ${book.department}`);
        console.log(`    status: ${book.status}`);
        console.log(`    locationRack: ${book.locationRack}`);
        console.log(`    shelf: ${book.shelf}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkCurrentDB();
