// Debug data insertion
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function debugDataInsertion() {
  try {
    console.log('🔍 Debugging data insertion...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '../../python/books_cleaned.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📚 Found ${jsonData.length} books in JSON file`);
    
    // Check first book structure
    const firstBook = jsonData[0];
    console.log('\n📋 First book from JSON:');
    console.log('  bookId:', firstBook.bookId);
    console.log('  accNo:', firstBook.accNo);
    console.log('  title:', firstBook.title);
    console.log('  department:', firstBook.department);
    console.log('  status:', firstBook.status);
    
    // Clear existing books
    const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
    await Book.deleteMany({});
    console.log('🗑️ Cleared existing books');
    
    // Insert just first book for testing
    const testBook = {
      bookId: firstBook.bookId || '',
      accNo: firstBook.accNo || '',
      title: firstBook.title || '',
      authors: firstBook.authors || [],
      author: firstBook.authors && firstBook.authors.length > 0 ? firstBook.authors.join(', ') : '',
      publisher: firstBook.publisher || '',
      publishedYear: firstBook.publishedYear || null,
      department: firstBook.department || '',
      status: firstBook.status || '',
      location: firstBook.location || { rack: null, shelf: null },
      callNumber: firstBook.callNumber || '',
      edition: firstBook.edition || null,
      copies: firstBook.copies || 1,
      addedBy: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('\n📋 Test book to insert:');
    console.log('  bookId:', testBook.bookId);
    console.log('  accNo:', testBook.accNo);
    console.log('  title:', testBook.title);
    console.log('  department:', testBook.department);
    console.log('  status:', testBook.status);
    
    const insertedBook = await Book.create(testBook);
    console.log('\n✅ Inserted test book');
    
    // Verify insertion
    const retrievedBook = await Book.findOne({ bookId: testBook.bookId });
    console.log('\n📋 Retrieved book:');
    console.log('  bookId:', retrievedBook.bookId);
    console.log('  accNo:', retrievedBook.accNo);
    console.log('  title:', retrievedBook.title);
    console.log('  department:', retrievedBook.department);
    console.log('  status:', retrievedBook.status);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

debugDataInsertion();
