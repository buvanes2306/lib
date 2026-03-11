// Get actual departments and statuses from database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function getDepartmentsAndStatuses() {
  try {
    console.log('🔍 Getting departments and statuses from database...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books in database: ${allBooks.length}`);
    
    // Get unique departments
    const departments = [...new Set(allBooks.map(book => book.department).filter(dept => dept))];
    console.log('\n🏢 Departments found:');
    departments.forEach(dept => console.log(`  - ${dept}`));
    
    // Get unique statuses
    const statuses = [...new Set(allBooks.map(book => book.status).filter(status => status))];
    console.log('\n📊 Statuses found:');
    statuses.forEach(status => console.log(`  - ${status}`));
    
    console.log('\n📋 Summary:');
    console.log(`  Departments: ${departments.length}`);
    console.log(`  Statuses: ${statuses.length}`);
    
    // Get sample books for each department
    console.log('\n📋 Sample books by department:');
    departments.forEach(dept => {
      const deptBooks = allBooks.filter(book => book.department === dept);
      if (deptBooks.length > 0) {
        console.log(`\n  ${dept} (${deptBooks.length} books):`);
        deptBooks.slice(0, 3).forEach(book => {
          console.log(`    - ${book.title} (${book.status})`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

getDepartmentsAndStatuses();
