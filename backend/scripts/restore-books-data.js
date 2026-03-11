// Restore books data from JSON file
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function restoreBooksData() {
  try {
    console.log('🔄 Restoring books data...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '../../python/books_cleaned.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📚 Found ${jsonData.length} books in JSON file`);
    
    // Clear existing books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    await Book.deleteMany({});
    console.log('🗑️ Cleared existing books');
    
    // Insert books from JSON
    const booksToInsert = jsonData.map(book => ({
      bookId: book.bookId || '',
      accNo: book.accNo?.toString() || '',
      title: book.title || '',
      authors: book.authors || [],
      author: book.authors && book.authors.length > 0 ? book.authors.join(', ') : '',
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || null,
      department: book.department || '',
      status: book.status || '',
      locationRack: book.location?.rack?.toString() || '',
      shelf: book.location?.shelf?.toString() || '',
      callNumber: book.callNumber || '',
      edition: book.edition || null,
      numberOfCopies: book.copies || 1,
      addedBy: null, // Will be set later
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const insertedBooks = await Book.insertMany(booksToInsert);
    console.log(`✅ Inserted ${insertedBooks.length} books`);
    
    // Verify insertion
    const totalBooks = await Book.countDocuments();
    console.log(`📊 Total books in database: ${totalBooks}`);
    
    // Show sample
    const sampleBooks = await Book.find({}).limit(3);
    console.log('\n📋 Sample books:');
    sampleBooks.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title}`);
      console.log(`     Department: ${book.department}`);
      console.log(`     Status: ${book.status}`);
      console.log(`     AccNo: ${book.accNo}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

restoreBooksData();
