import mongoose from 'mongoose';
import Book from '../models/Book.js';

async function checkAccNos() {
  try {
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    
    const books = await Book.find().limit(10).select('accNo title');
    console.log('📚 Sample books with accession numbers:');
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.accNo} - ${book.title}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAccNos();
