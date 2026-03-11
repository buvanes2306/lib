// Test search for "computer"
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testSearchComputer() {
  try {
    console.log('🔍 Testing search for "computer"...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test API endpoint
    const response = await fetch('http://localhost:5000/api/books?search=computer');
    
    const text = await response.text();
    console.log('📥 API response status:', response.status);
    
    if (response.ok) {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ API search working!');
        console.log('📚 Books found:', data.data.books.length);
        console.log('📊 Total books:', data.data.pagination.total);
        
        if (data.data.books.length > 0) {
          console.log('\n📋 Sample books found:');
          data.data.books.slice(0, 3).forEach((book, index) => {
            console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
            console.log(`     Author: ${book.author || 'undefined'}`);
            console.log(`     Authors: ${book.authors ? book.authors.join(', ') : 'undefined'}`);
          });
        } else {
          console.log('📭 No books found for search term "computer"');
        }
      } else {
        console.log('❌ API response format error');
      }
    } else {
      console.log('❌ API request failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testSearchComputer();
