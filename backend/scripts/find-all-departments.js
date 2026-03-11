// Find all departments in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function findAllDepartments() {
  try {
    console.log('🔍 Finding all departments in database...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books in database: ${allBooks.length}`);
    
    // Collect all department values
    const departments = new Set();
    const deptCounts = {};
    
    allBooks.forEach(book => {
      const dept = book.department;
      if (dept && dept !== 'undefined' && dept !== undefined) {
        departments.add(dept);
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      }
    });
    
    console.log('\n🏢 Departments found:');
    if (departments.size === 0) {
      console.log('  ❌ No valid departments found');
      
      // Let's check what values are actually stored
      console.log('\n🔍 Checking raw department values:');
      const rawDepts = allBooks.slice(0, 10).map(book => book.department);
      rawDepts.forEach((dept, index) => {
        console.log(`  Book ${index + 1}: "${dept}" (${typeof dept})`);
      });
    } else {
      const deptArray = Array.from(departments);
      deptArray.forEach(dept => {
        console.log(`  - ${dept} (${deptCounts[dept]} books)`);
      });
    }
    
    // Also check for any books with actual data
    console.log('\n🔍 Looking for books with actual data...');
    const booksWithData = allBooks.filter(book => 
      book.title && book.title !== 'undefined' && book.title !== undefined
    );
    
    console.log(`📚 Books with actual titles: ${booksWithData.length}`);
    
    if (booksWithData.length > 0) {
      console.log('\n📋 Sample books with data:');
      booksWithData.slice(0, 5).forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title}`);
        console.log(`     Department: "${book.department}"`);
        console.log(`     Status: "${book.status}"`);
        console.log(`     AccNo: "${book.accNo}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

findAllDepartments();
