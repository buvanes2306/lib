// Debug department filter specifically
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debugDepartmentFilter() {
  try {
    console.log('🔍 Debugging department filter...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books first
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books: ${allBooks.length}`);
    
    // Get unique departments
    const departments = [...new Set(allBooks.map(book => book.department).filter(dept => dept && dept !== 'undefined'))];
    console.log('\n🏢 Departments found:');
    departments.forEach(dept => {
      const count = allBooks.filter(book => book.department === dept).length;
      console.log(`  - ${dept}: ${count} books`);
    });
    
    // Test department filter manually
    console.log('\n🔍 Testing department filter manually...');
    
    const testDept = 'INFORMATION TECHNOLOGY';
    console.log(`\n📋 Testing department: "${testDept}"`);
    
    // Method 1: Direct query
    const directQuery = await Book.find({ department: testDept });
    console.log(`🔍 Direct query result: ${directQuery.length} books`);
    
    // Method 2: Regex query (like backend)
    const regexQuery = await Book.find({ department: { $regex: testDept, $options: 'i' } });
    console.log(`🔍 Regex query result: ${regexQuery.length} books`);
    
    // Method 3: Case-insensitive exact match
    const caseInsensitiveQuery = await Book.find({ 
      department: { $regex: `^${testDept}$`, $options: 'i' } 
    });
    console.log(`🔍 Case-insensitive exact match: ${caseInsensitiveQuery.length} books`);
    
    // Show sample results
    if (directQuery.length > 0) {
      console.log('\n📋 Sample books from INFORMATION TECHNOLOGY:');
      directQuery.slice(0, 3).forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title}`);
        console.log(`     Department: "${book.department}"`);
        console.log(`     Status: "${book.status}"`);
        console.log(`     AccNo: ${book.accNo}`);
      });
    }
    
    // Test other departments
    const otherDepts = ['COMPUTER SCIENCE', 'ELECTRONICS'];
    for (const dept of otherDepts) {
      const books = await Book.find({ department: dept });
      console.log(`\n📋 ${dept}: ${books.length} books`);
    }
    
    // Test the actual API endpoint
    console.log('\n🌐 Testing actual API endpoint...');
    try {
      const response = await fetch(`http://localhost:5000/api/books?department=${encodeURIComponent(testDept)}`);
      const data = await response.json();
      
      console.log(`\n📡 API Response Status: ${data.success ? 'Success' : 'Failed'}`);
      console.log(`📡 API Books Found: ${data.data ? data.data.books.length : 0}`);
      
      if (data.data && data.data.books.length > 0) {
        console.log('\n📋 Sample API results:');
        data.data.books.slice(0, 3).forEach((book, index) => {
          console.log(`  ${index + 1}. ${book.title}`);
          console.log(`     Department: "${book.department}"`);
          console.log(`     Status: "${book.status}"`);
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

debugDepartmentFilter();
