// Check bookId data in database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkBookIdData() {
  try {
    console.log('🔍 Checking bookId data in database...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books and check for bookId field
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books in database: ${allBooks.length}`);
    
    // Find books with bookId field
    const booksWithBookId = allBooks.filter(book => book.bookId);
    console.log(`📚 Books with bookId field: ${booksWithBookId.length}`);
    
    if (booksWithBookId.length > 0) {
      console.log('\n📋 Books with bookId:');
      booksWithBookId.slice(0, 5).forEach((book, index) => {
        console.log(`  ${index + 1}. Book ID: ${book.bookId} - AccNo: ${book.accNo}`);
        console.log(`     Title: ${book.title}`);
        console.log(`     Author: ${book.author || (book.authors ? book.authors.join(', ') : 'N/A')}`);
      });
    } else {
      console.log('\n📭 No books have bookId field in database');
    }
    
    // Test search for books with bookId field
    if (booksWithBookId.length > 0) {
      console.log('\n🔍 Testing search for bookId...');
      const firstBookId = booksWithBookId[0].bookId;
      console.log(`🔍 Searching for: ${firstBookId}`);
      
      const response = await fetch(`http://localhost:5000/api/books?search=${firstBookId}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('📚 Search results:', data.data.books.length);
        if (data.data.books.length > 0) {
          console.log('✅ Search found books with bookId!');
        } else {
          console.log('❌ Search did not find books with bookId');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkBookIdData();
