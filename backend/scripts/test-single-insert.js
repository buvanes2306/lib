// Test single book insertion
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';

dotenv.config();

async function testSingleInsert() {
  try {
    console.log('🧪 Testing single book insertion...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Clear database
    await Book.deleteMany({});
    console.log('🗑️ Cleared database');
    
    // Insert one test book
    const testBook = {
      bookId: "00001",
      accNo: "4281",
      title: "Information Technology an Info Guide",
      authors: ["Akshay Kumar"],
      author: "Akshay Kumar",
      publisher: "Authorpress",
      publishedYear: 2000,
      department: "INFORMATION TECHNOLOGY",
      status: "Available",
      locationRack: "1",
      shelf: "60",
      callNumber: "3.54",
      edition: "1",
      numberOfCopies: 1,
      addedBy: null
    };
    
    console.log('\n📋 Test book:');
    console.log('  bookId:', testBook.bookId);
    console.log('  accNo:', testBook.accNo);
    console.log('  title:', testBook.title);
    console.log('  department:', testBook.department);
    console.log('  status:', testBook.status);
    
    const insertedBook = await Book.create(testBook);
    console.log('\n✅ Inserted book with ID:', insertedBook._id);
    
    // Verify insertion
    const retrievedBook = await Book.findOne({ bookId: "00001" });
    console.log('\n📋 Retrieved book:');
    console.log('  bookId:', retrievedBook.bookId);
    console.log('  accNo:', retrievedBook.accNo);
    console.log('  title:', retrievedBook.title);
    console.log('  department:', retrievedBook.department);
    console.log('  status:', retrievedBook.status);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
  }
}

testSingleInsert();
