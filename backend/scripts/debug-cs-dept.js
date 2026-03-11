// Debug Computer Science department specifically
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';

dotenv.config();

async function debugCSDept() {
  try {
    console.log('🔍 Debugging Computer Science department...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test different queries
    console.log('\n🧪 Testing different department queries:');
    
    // 1. Exact match
    const exactMatch = await Book.find({ department: 'COMPUTER SCIENCE' }).limit(3);
    console.log('1. Exact "COMPUTER SCIENCE":', exactMatch.length, 'books');
    
    // 2. Case-insensitive partial
    const caseInsensitive = await Book.find({ department: { $regex: 'Computer Science', $options: 'i' } }).limit(3);
    console.log('2. Case-insensitive "Computer Science":', caseInsensitive.length, 'books');
    
    // 3. Case-insensitive with word boundaries
    const wordBoundary = await Book.find({ department: { $regex: '\\bComputer Science\\b', $options: 'i' } }).limit(3);
    console.log('3. Word boundary "Computer Science":', wordBoundary.length, 'books');
    
    // 4. Check all departments containing "computer"
    const containsComputer = await Book.find({ department: { $regex: 'computer', $options: 'i' } }).limit(3);
    console.log('4. Contains "computer":', containsComputer.length, 'books');
    
    // 5. Show all unique departments
    const allBooks = await Book.find({});
    const departments = [...new Set(allBooks.map(book => book.department))];
    console.log('\n📋 All departments in database:');
    departments.forEach(dept => {
      const count = allBooks.filter(book => book.department === dept).length;
      console.log(`  - "${dept}": ${count} books`);
    });
    
    // Show sample CS books if found
    if (exactMatch.length > 0) {
      console.log('\n📋 Sample Computer Science books:');
      exactMatch.forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title}`);
        console.log(`     Department: "${book.department}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

debugCSDept();
