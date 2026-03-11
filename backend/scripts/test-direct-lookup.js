import mongoose from 'mongoose';
import Book from '../models/Book.js';

async function testDirectLookup() {
  try {
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    
    console.log('🔍 Testing direct book lookup...');
    
    // Test by accNo
    const bookByAccNo = await Book.findOne({ accNo: '4281' });
    console.log('📚 Book by accNo:', bookByAccNo ? bookByAccNo.title : 'Not found');
    
    // Test by bookId
    const bookByBookId = await Book.findOne({ bookId: '00022' });
    console.log('📚 Book by bookId:', bookByBookId ? bookByBookId.title : 'Not found');
    
    // Test general query
    const allBooks = await Book.find().limit(3);
    console.log('📊 Total books in DB:', await Book.countDocuments());
    console.log('📚 Sample books:');
    allBooks.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.accNo} - ${book.title}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testDirectLookup();
