// Find real departments by checking for non-undefined values
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function findRealDepartments() {
  try {
    console.log('🔍 Finding real departments...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books: ${allBooks.length}`);
    
    // Find books with actual department values (not "undefined")
    const booksWithRealDepts = allBooks.filter(book => 
      book.department && 
      book.department !== 'undefined' && 
      book.department !== undefined &&
      book.department !== null &&
      book.department !== ''
    );
    
    console.log(`📚 Books with real departments: ${booksWithRealDepts.length}`);
    
    if (booksWithRealDepts.length > 0) {
      const departments = [...new Set(booksWithRealDepts.map(book => book.department))];
      console.log('\n🏢 Real departments found:');
      departments.forEach(dept => {
        const count = booksWithRealDepts.filter(book => book.department === dept).length;
        console.log(`  - ${dept} (${count} books)`);
      });
      
      // Show sample books
      console.log('\n📋 Sample books with real departments:');
      booksWithRealDepts.slice(0, 5).forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title || 'No title'}`);
        console.log(`     Department: ${book.department}`);
        console.log(`     Status: ${book.status || 'No status'}`);
        console.log(`     AccNo: ${book.accNo || 'No accNo'}`);
      });
    } else {
      console.log('\n❌ No books with real departments found');
      
      // Let's check what other departments might exist by looking at the data more carefully
      console.log('\n🔍 Checking for any department-like values...');
      const possibleDepts = allBooks.map(book => book.department);
      const uniqueDepts = [...new Set(possibleDepts)];
      
      console.log('📋 All department values found:');
      uniqueDepts.forEach(dept => {
        const count = allBooks.filter(book => book.department === dept).length;
        console.log(`  - "${dept}" (${count} books)`);
      });
    }
    
    // Also check for real statuses
    const booksWithRealStatuses = allBooks.filter(book => 
      book.status && 
      book.status !== 'undefined' && 
      book.status !== undefined &&
      book.status !== null &&
      book.status !== ''
    );
    
    console.log(`\n📚 Books with real statuses: ${booksWithRealStatuses.length}`);
    
    if (booksWithRealStatuses.length > 0) {
      const statuses = [...new Set(booksWithRealStatuses.map(book => book.status))];
      console.log('\n📊 Real statuses found:');
      statuses.forEach(status => {
        const count = booksWithRealStatuses.filter(book => book.status === status).length;
        console.log(`  - ${status} (${count} books)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

findRealDepartments();
