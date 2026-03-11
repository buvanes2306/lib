// Check Book Data Structure
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkBookData() {
  try {
    console.log('🔍 Checking Book Data Structure...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get raw collection data
    const booksCollection = mongoose.connection.collection('books');
    const books = await booksCollection.find({}).limit(3).toArray();
    
    console.log('📚 Raw book data structure:');
    books.forEach((book, index) => {
      console.log(`\nBook ${index + 1}:`);
      console.log('  _id:', book._id);
      console.log('  title:', book.title);
      console.log('  author:', book.author);
      console.log('  authors:', book.authors);
      console.log('  publisher:', book.publisher);
      console.log('  department:', book.department);
      console.log('  status:', book.status);
      console.log('  ---');
    });
    
    // Check if author field exists as array
    const hasAuthorArray = books.some(book => book.authors);
    const hasAuthorString = books.some(book => book.author);
    
    console.log('\n🔍 Data Structure Analysis:');
    console.log('  Has author array:', hasAuthorArray ? 'Yes' : 'No');
    console.log('  Has author string:', hasAuthorString ? 'Yes' : 'No');
    
    if (hasAuthorArray) {
      console.log('\n🔧 SOLUTION: Update Book model to use authors array');
      console.log('  Update frontend to handle authors array');
    }
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkBookData();
