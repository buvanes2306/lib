// Debug Search for "17106"
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debugSearch17106() {
  try {
    console.log('🔍 Debugging search for "17106"...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Test search by accession number
    console.log('\n🔍 Testing search by accession number...');
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    
    const accNoSearch = await Book.find({
      accNo: { $regex: '17106', $options: 'i' }
    });
    console.log('📚 AccNo search results:', accNoSearch.length);
    
    // Test search by title
    console.log('\n🔍 Testing search by title...');
    const titleSearch = await Book.find({
      title: { $regex: '17106', $options: 'i' }
    });
    console.log('📚 Title search results:', titleSearch.length);
    
    // Test search by author
    console.log('\n🔍 Testing search by author...');
    const authorSearch = await Book.find({
      author: { $regex: '17106', $options: 'i' }
    });
    console.log('📚 Author search results:', authorSearch.length);
    
    // Test search by authors array
    console.log('\n🔍 Testing search by authors array...');
    const authorsSearch = await Book.find({
      authors: { $regex: '17106', $options: 'i' }
    });
    console.log('📚 Authors search results:', authorsSearch.length);
    
    // Test combined search
    console.log('\n🔍 Testing combined search...');
    const combinedSearch = await Book.find({
      $or: [
        { title: { $regex: '17106', $options: 'i' } },
        { author: { $regex: '17106', $options: 'i' } },
        { authors: { $regex: '17106', $options: 'i' } },
        { accNo: { $regex: '17106', $options: 'i' } }
      ]
    });
    console.log('📚 Combined search results:', combinedSearch.length);
    
    // Show sample books if found
    if (combinedSearch.length > 0) {
      console.log('\n📋 Books found:');
      combinedSearch.slice(0, 3).forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
        console.log(`     Author: ${book.author || 'undefined'}`);
        console.log(`     Authors: ${book.authors ? book.authors.join(', ') : 'undefined'}`);
      });
    } else {
      console.log('\n📭 No books found for search term "17106"');
    }
    
    // Test API endpoint
    console.log('\n🔍 Testing API endpoint...');
    const response = await fetch('http://localhost:5000/api/books?search=17106');
    
    const text = await response.text();
    console.log('📥 API response status:', response.status);
    console.log('📥 API response text:', text.substring(0, 300) + '...');
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        if (data.success) {
          console.log('✅ API search working!');
          console.log('📚 Books found:', data.data.books.length);
          
          if (data.data.books.length > 0) {
            console.log('\n📋 Sample books from API:');
            data.data.books.slice(0, 3).forEach((book, index) => {
              console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
              console.log(`     Author: ${book.author || 'undefined'}`);
              console.log(`     Authors: ${book.authors ? book.authors.join(', ') : 'undefined'}`);
            });
          } else {
            console.log('📭 No books found for search term "17106"');
          }
        } else {
          console.log('❌ API response format error');
        }
      } catch (parseError) {
        console.log('❌ Parse error:', parseError.message);
      }
    } else {
      console.log('❌ API request failed');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

debugSearch17106();
