// Debug API response to check field names
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debugApiResponse() {
  try {
    console.log('🔍 Debugging API response...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get sample books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const sampleBooks = await Book.find({}).limit(3);
    
    console.log('\n📚 Raw MongoDB data:');
    sampleBooks.forEach((book, index) => {
      console.log(`\n  Book ${index + 1}:`);
      console.log(`    bookId: "${book.bookId}"`);
      console.log(`    accNo: "${book.accNo}"`);
      console.log(`    title: "${book.title}"`);
      console.log(`    department: "${book.department}"`);
      console.log(`    status: "${book.status}"`);
      console.log(`    publishedYear: ${book.publishedYear}`);
    });
    
    // Simulate API response transformation
    console.log('\n🔄 API Response (after processing):');
    const processedBooks = sampleBooks.map(book => ({
      ...book.toObject(),
      id: book._id,
      _id: book._id
    }));
    
    processedBooks.forEach((book, index) => {
      console.log(`\n  Processed Book ${index + 1}:`);
      console.log(`    bookId: "${book.bookId}"`);
      console.log(`    accNo: "${book.accNo}"`);
      console.log(`    title: "${book.title}"`);
      console.log(`    department: "${book.department}"`);
      console.log(`    status: "${book.status}"`);
      console.log(`    publishedYear: ${book.publishedYear}`);
    });
    
    // Test the actual API endpoint
    console.log('\n🌐 Testing actual API endpoint...');
    try {
      const response = await fetch('http://localhost:5000/api/books?limit=3');
      const data = await response.json();
      
      if (data.success && data.data.books) {
        console.log('\n📡 Actual API Response:');
        data.data.books.forEach((book, index) => {
          console.log(`\n  API Book ${index + 1}:`);
          console.log(`    bookId: "${book.bookId}"`);
          console.log(`    accNo: "${book.accNo}"`);
          console.log(`    title: "${book.title}"`);
          console.log(`    department: "${book.department}"`);
          console.log(`    status: "${book.status}"`);
          console.log(`    publishedYear: ${book.publishedYear}`);
        });
      }
    } catch (error) {
      console.log('❌ API Error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

debugApiResponse();
