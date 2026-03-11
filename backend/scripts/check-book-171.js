// Check if any books contain "171"
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkBook171() {
  try {
    console.log('🔍 Checking if any books contain "171"...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const allBooks = await Book.find({});
    
    console.log(`📚 Total books in database: ${allBooks.length}`);
    
    // Check for "171" in any field
    const booksWith171 = allBooks.filter(book => {
      const searchString = '171';
      return (
        (book.title && book.title.includes(searchString)) ||
        (book.author && book.author.includes(searchString)) ||
        (book.authors && book.authors.some(author => author.includes(searchString))) ||
        (book.accNo && book.accNo.includes(searchString))
      );
    });
    
    console.log(`📚 Books containing "171": ${booksWith171.length}`);
    
    if (booksWith171.length > 0) {
      console.log('\n📋 Books with "171":');
      booksWith171.forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
        console.log(`     Title contains "171": ${book.title.includes('171') ? 'Yes' : 'No'}`);
        console.log(`     Author contains "171": ${book.author && book.author.includes('171') ? 'Yes' : 'No'}`);
        console.log(`     Authors contains "171": ${book.authors && book.authors.some(author => author.includes('171')) ? 'Yes' : 'No'}`);
        console.log(`     AccNo contains "171": ${book.accNo && book.accNo.includes('171') ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('\n📭 No books in database contain "171"');
    }
    
  } catch (error) {
    console.error('❌ Check error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkBook171();
