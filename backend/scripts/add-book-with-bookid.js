// Add a sample book with bookId
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function addBookWithBookId() {
  try {
    console.log('🔍 Adding sample book with bookId...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Define Book schema
    const bookSchema = new mongoose.Schema({}, { collection: 'books' });
    const Book = mongoose.model('Book', bookSchema);
    
    // Create sample book with bookId
    const sampleBook = {
      bookId: "00018",
      accNo: 5916,
      title: "Operation Research Concepts and Cases",
      authors: ["Hillier", "Frederick S."],
      publisher: "McGraw-Hill",
      publishedYear: 2008,
      department: "INFORMATION TECHNOLOGY",
      status: "Available",
      location: { rack: 1, shelf: 60 },
      callNumber: "1",
      edition: 8,
      copies: 1,
      addedBy: "699bd8b4de7f9b7ada8236d9", // Admin user ID
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if book already exists
    const existingBook = await Book.findOne({ accNo: sampleBook.accNo });
    if (existingBook) {
      console.log('📚 Book already exists, updating with bookId...');
      await Book.updateOne({ accNo: sampleBook.accNo }, { $set: { bookId: sampleBook.bookId } });
      console.log('✅ Book updated with bookId');
    } else {
      await Book.create(sampleBook);
      console.log('✅ Sample book created with bookId');
    }
    
    // Test search for the bookId
    console.log('\n🔍 Testing search for bookId "00018"...');
    const response = await fetch('http://localhost:5000/api/books?search=00018');
    const data = await response.json();
    
    if (data.success) {
      console.log('📚 Search results:', data.data.books.length);
      if (data.data.books.length > 0) {
        console.log('✅ Search found book with bookId!');
        data.data.books.forEach((book, index) => {
          console.log(`  ${index + 1}. Book ID: ${book.bookId} - AccNo: ${book.accNo}`);
          console.log(`     Title: ${book.title}`);
        });
      } else {
        console.log('❌ Search did not find book with bookId');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

addBookWithBookId();
