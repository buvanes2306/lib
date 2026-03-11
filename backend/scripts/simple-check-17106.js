// Simple check for book 17106
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function simpleCheck17106() {
  try {
    console.log('🔍 Checking for book 17106...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books in database: ${allBooks.length}`);
    
    // Find book with accNo 17106
    const book17106 = await Book.findOne({ accNo: '17106' });
    
    if (book17106) {
      console.log('\n✅ Found book 17106:');
      console.log(`  Title: ${book17106.title}`);
      console.log(`  AccNo: ${book17106.accNo}`);
      console.log(`  Author: ${book17106.author || 'undefined'}`);
      console.log(`  Authors: ${book17106.authors ? book17106.authors.join(', ') : 'undefined'}`);
    } else {
      console.log('\n❌ Book 17106 not found in database');
    }
    
    // Test search for 17106
    console.log('\n🔍 Testing search for 17106...');
    const response = await fetch('http://localhost:5000/api/books?search=17106');
    
    const text = await response.text();
    console.log('📥 API response status:', response.status);
    
    if (response.ok) {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ API search working!');
        console.log('📚 Books found: ' + data.data.books.length);
        
        if (data.data.books.length > 0) {
          console.log('\n📋 Books found by search:');
          data.data.books.forEach((book, index) => {
            console.log('  ' + (index + 1) + '. ' + book.title + ' - ' + book.accNo);
          });
        } else {
          console.log('\n📭 No books found for search term 17106');
        }
      } else {
        console.log('❌ API response format error');
      }
    } else {
      console.log('❌ API request failed');
    }
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

simpleCheck17106();
