// Debug exact API call from frontend
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';

dotenv.config();

async function debugExactAPICall() {
  try {
    console.log('🔍 Debugging exact API call...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Simulate exact frontend API call
    const department = 'Computer Science';
    console.log('\n📋 Simulating frontend call:');
    console.log('  Department parameter:', department);
    
    // Build query exactly like backend
    let query = {};
    if (department) {
      query.department = { $regex: department, $options: 'i' };
      console.log('  Query built:', JSON.stringify(query, null, 2));
    }
    
    // Execute query
    const books = await Book.find(query).limit(10);
    console.log(`\n📚 Books found: ${books.length}`);
    
    if (books.length > 0) {
      console.log('\n📋 Sample books:');
      books.forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title}`);
        console.log(`     Department: "${book.department}"`);
        console.log(`     Status: ${book.status}`);
      });
    } else {
      console.log('\n❌ No books found');
    }
    
    // Test different department values
    console.log('\n🧪 Testing different department values:');
    const testDepts = ['Computer Science', 'COMPUTER SCIENCE', 'computer science', 'COMPUTER SCIENCE'];
    
    for (const testDept of testDepts) {
      const testQuery = { department: { $regex: testDept, $options: 'i' } };
      const testBooks = await Book.find(testQuery).limit(3);
      console.log(`  "${testDept}": ${testBooks.length} books`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

debugExactAPICall();
