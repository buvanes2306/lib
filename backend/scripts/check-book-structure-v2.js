import mongoose from 'mongoose';
import Book from '../models/Book.js';

async function checkBookStructure() {
  try {
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    
    console.log('🔍 Checking book structure...');
    
    const book = await Book.findOne({ accNo: '4281' });
    if (book) {
      console.log('📚 Book found:');
      console.log('  accNo:', JSON.stringify(book.accNo), 'Type:', typeof book.accNo);
      console.log('  bookId:', JSON.stringify(book.bookId), 'Type:', typeof book.bookId);
      console.log('  title:', book.title);
    } else {
      console.log('❌ Book not found, checking all books...');
      const books = await Book.find().limit(3);
      books.forEach((book, index) => {
        console.log(`📚 Book ${index + 1}:`);
        console.log(`  accNo: ${JSON.stringify(book.accNo)} (${typeof book.accNo})`);
        console.log(`  bookId: ${JSON.stringify(book.bookId)} (${typeof book.bookId})`);
        console.log(`  title: ${book.title}`);
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBookStructure();
