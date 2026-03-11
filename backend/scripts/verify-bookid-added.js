// Verify bookId was added
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function verifyBookIdAdded() {
  try {
    console.log('🔍 Verifying bookId was added...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Define Book schema
    const bookSchema = new mongoose.Schema({}, { collection: 'books' });
    const Book = mongoose.model('Book', bookSchema);
    
    // Find book with accNo 5916
    const book = await Book.findOne({ accNo: 5916 });
    
    if (book) {
      console.log('📚 Found book:');
      console.log('  AccNo:', book.accNo);
      console.log('  Book ID:', book.bookId || 'Not set');
      console.log('  Title:', book.title);
      console.log('  Author:', book.author || (book.authors ? book.authors.join(', ') : 'N/A'));
      
      if (book.bookId) {
        console.log('\n✅ BookId is set, testing search...');
        
        // Test search
        const response = await fetch('http://localhost:5000/api/books?search=' + book.bookId);
        const data = await response.json();
        
        console.log('📥 Search response status:', response.status);
        if (data.success) {
          console.log('📚 Search results:', data.data.books.length);
          if (data.data.books.length > 0) {
            console.log('✅ Search found book!');
            data.data.books.forEach((foundBook, index) => {
              console.log(`  ${index + 1}. Book ID: ${foundBook.bookId} - AccNo: ${foundBook.accNo}`);
            });
          } else {
            console.log('❌ Search did not find book');
          }
        }
      } else {
        console.log('❌ BookId is not set');
      }
    } else {
      console.log('❌ Book not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

verifyBookIdAdded();
