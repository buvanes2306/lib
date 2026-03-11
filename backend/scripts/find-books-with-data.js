// Find books with actual data
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function findBooksWithData() {
  try {
    console.log('🔍 Finding books with actual data...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get books with actual data (not undefined)
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    
    // Find books with actual title
    const booksWithTitle = await Book.find({ 
      title: { $exists: true, $ne: null, $ne: "undefined" } 
    }).limit(5);
    
    console.log('\n📚 Books with actual titles:');
    booksWithTitle.forEach((book, index) => {
      console.log(`\n  Book ${index + 1}:`);
      console.log(`    title: "${book.title}"`);
      console.log(`    accNo: "${book.accNo}"`);
      console.log(`    department: "${book.department}"`);
      console.log(`    status: "${book.status}"`);
      console.log(`    author: "${book.author}"`);
    });
    
    // If no books with actual data, let's check the book we added earlier
    if (booksWithTitle.length === 0) {
      console.log('\n📚 No books with actual data found. Checking for our test book...');
      const testBook = await Book.findOne({ accNo: "5916" });
      if (testBook) {
        console.log('\n📚 Found our test book:');
        console.log(`    title: "${testBook.title}"`);
        console.log(`    accNo: "${testBook.accNo}"`);
        console.log(`    department: "${testBook.department}"`);
        console.log(`    status: "${testBook.status}"`);
        console.log(`    bookId: "${testBook.bookId}"`);
      } else {
        console.log('\n❌ Test book not found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

findBooksWithData();
