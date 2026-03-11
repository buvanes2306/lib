import mongoose from 'mongoose';
import Book from '../models/Book.js';

async function testYearQuery() {
  try {
    console.log('🔍 Testing MongoDB query: { publishedYear: 2010 }');
    
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    
    const books = await Book.find({ publishedYear: 2010 }).limit(5);
    console.log('📊 Results:', books.length, 'books found');
    
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - Year: ${book.publishedYear} - Dept: ${book.department}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testYearQuery();
