// Test Books Search API
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testBooksSearch() {
  try {
    console.log('🔍 Testing Books Search API...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test search functionality
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    
    // Test search by title
    console.log('\n🔍 Testing search by title...');
    const searchResults = await Book.find({
      $or: [
        { title: { $regex: 'computer', $options: 'i' } },
        { author: { $regex: 'computer', $options: 'i' } },
        { department: { $regex: 'computer', $options: 'i' } }
      ]
    });
    
    console.log('📚 Search results:', searchResults.length);
    
    if (searchResults.length > 0) {
      console.log('📋 Sample books found:');
      searchResults.slice(0, 3).forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title} - ${book.author}`);
      });
    }
    
    // Test API endpoint directly
    console.log('\n🔍 Testing API endpoint...');
    const fetch = await import('node-fetch');
    const response = await fetch.default('http://localhost:5000/api/books?search=computer');
    
    const text = await response.text();
    console.log('📥 API response status:', response.status);
    console.log('📥 API response text:', text.substring(0, 200) + '...');
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        if (data.success) {
          console.log('✅ API search working!');
          console.log('📚 Books found:', data.data.books.length);
          console.log('📊 Total books:', data.data.pagination.total);
        } else {
          console.log('❌ API search failed:', data.message);
        }
      } catch (parseError) {
        console.log('❌ Parse error:', parseError.message);
      }
    } else {
      console.log('❌ API request failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testBooksSearch();
