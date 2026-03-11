// Check for similar accession numbers
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkSimilarAccNo() {
  try {
    console.log('🔍 Checking for similar accession numbers...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books and check for accession numbers starting with "171"
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books in database: ${allBooks.length}`);
    
    // Find books with accession numbers starting with "171"
    const booksWith171 = allBooks.filter(book => 
      book.accNo && book.accNo.startsWith('171')
    );
    );
    
    console.log(`📚 Books with accession number starting with "171": ${booksWith171.length}`);
    
    if (booksWith171.length > 0) {
      console.log('\n📋 Books with accession starting with "171":');
      booksWith171.forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
        console.log(`     Author: ${book.author || 'undefined'}`);
        console.log(`     Authors: ${book.authors ? book.authors.join(', ') : 'undefined'}`);
      });
    } else {
      console.log('\n📭 No books with accession number starting with "171"');
    }
    
    // Test search for "171" to see if it finds the books with "17106"
    console.log('\n🔍 Testing search for "171"...');
    const response = await fetch('http://localhost:5000/api/books?search=171');
    
    const text = await response.text();
    console.log('📥 API response status:', response.status);
    
    if (response.ok) {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ API search working!');
        console.log('📚 Books found for "171": ${data.data.books.length}`);
        
        if (data.data.books.length > 0) {
          console.log('\n📋 Books found for "171":');
          data.data.books.slice(0, 3).forEach((book, index) => {
            console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
          });
        } else {
          console.log('\n📭 No books found for "171"');
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

checkSimilarAccNo();
