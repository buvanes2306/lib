// Get exact department values from database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function getExactDepartments() {
  try {
    console.log('🔍 Getting exact department values...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    // Get unique departments
    const departments = [...new Set(allBooks.map(book => book.department).filter(dept => dept && dept !== 'undefined'))];
    
    console.log('\n📊 Exact Department Values in Database:');
    departments.forEach(dept => {
      const count = allBooks.filter(book => book.department === dept).length;
      console.log(`  "${dept}": ${count} books`);
    });
    
    // Look for variations that might cause issues
    console.log('\n🔍 Looking for department variations:');
    const variations = ['MECHANICAL', 'SECE : MECHANICAL ENGG', 'SECE:MECH', 'SECE:CIVIL', 'SECE : General', 'CIVIL', 'GENERAL', 'MECHANICAL ENGG'];
    
    variations.forEach(variation => {
      const books = allBooks.filter(book => book.department === variation);
      console.log(`  "${variation}": ${books.length} books`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

getExactDepartments();
