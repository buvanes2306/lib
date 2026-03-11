// Check book structure in database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkBookStructure() {
  try {
    console.log('🔍 Checking book structure...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get sample books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    const sampleBooks = await Book.find({}).limit(5);
    
    console.log('\n📚 Sample book structure:');
    sampleBooks.forEach((book, index) => {
      console.log(`\n  Book ${index + 1}:`);
      console.log(`    _id: ${book._id}`);
      console.log(`    accNo: ${book.accNo}`);
      console.log(`    title: ${book.title}`);
      console.log(`    author: ${book.author}`);
      console.log(`    authors: ${book.authors ? book.authors.join(', ') : 'undefined'}`);
      console.log(`    publisher: ${book.publisher}`);
      console.log(`    publishedYear: ${book.publishedYear}`);
      console.log(`    department: ${book.department || 'undefined'}`);
      console.log(`    status: ${book.status || 'undefined'}`);
      console.log(`    bookId: ${book.bookId || 'undefined'}`);
      console.log(`    location: ${JSON.stringify(book.location)}`);
      console.log(`    callNumber: ${book.callNumber}`);
      console.log(`    edition: ${book.edition}`);
      console.log(`    copies: ${book.copies}`);
      console.log(`    addedBy: ${book.addedBy}`);
      console.log(`    createdAt: ${book.createdAt}`);
      console.log(`    updatedAt: ${book.updatedAt}`);
    });
    
    // Check if any books have department or status
    const booksWithDept = await Book.countDocuments({ department: { $exists: true, $ne: null } });
    const booksWithStatus = await Book.countDocuments({ status: { $exists: true, $ne: null } });
    
    console.log('\n📊 Field presence:');
    console.log(`  Books with department: ${booksWithDept}/${sampleBooks.length * 40}`);
    console.log(`  Books with status: ${booksWithStatus}/${sampleBooks.length * 40}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkBookStructure();
