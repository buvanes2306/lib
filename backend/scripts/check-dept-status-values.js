// Check actual department and status values
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDeptStatusValues() {
  try {
    console.log('🔍 Checking department and status values...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get books with department and status
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const books = await Book.find({}).limit(10);
    
    console.log('\n📚 First 10 books with their actual values:');
    books.forEach((book, index) => {
      console.log(`\n  Book ${index + 1} (${book._id}):`);
      console.log(`    accNo: ${book.accNo}`);
      console.log(`    title: ${book.title}`);
      console.log(`    department: "${book.department}"`);
      console.log(`    status: "${book.status}"`);
    });
    
    // Get unique departments and statuses
    const allBooks = await Book.find({});
    const departments = [...new Set(allBooks.map(book => book.department).filter(dept => dept))];
    const statuses = [...new Set(allBooks.map(book => book.status).filter(status => status))];
    
    console.log('\n🏢 Unique departments:');
    departments.forEach(dept => console.log(`  - "${dept}"`));
    
    console.log('\n📊 Unique statuses:');
    statuses.forEach(status => console.log(`  - "${status}"`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkDeptStatusValues();
