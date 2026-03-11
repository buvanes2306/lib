// Test Mongoose query with Book model
import mongoose from 'mongoose';
import Book from '../models/Book.js';

async function testMongooseQuery() {
  await mongoose.connect('mongodb://localhost:27017/librarydb');
  
  console.log('Testing Mongoose query...');
  
  // Test 1: Find with accNo as number using Mongoose
  console.log('\nTest 1: Book.find({ accNo: 4281 })');
  const test1 = await Book.find({ accNo: 4281 });
  console.log('  Results:', test1.length);
  
  // Test 2: Find with accNo as string
  console.log('\nTest 2: Book.find({ accNo: "4281" })');
  const test2 = await Book.find({ accNo: "4281" });
  console.log('  Results:', test2.length);
  
  // Test 3: Check model schema
  console.log('\nTest 3: Book schema accNo type:');
  const accNoPath = Book.schema.path('accNo');
  console.log('  Type:', accNoPath.instance);
  
  // Test 4: Raw collection find
  console.log('\nTest 4: Raw collection find({ accNo: 4281 })');
  const raw = await mongoose.connection.collection('books').find({ accNo: 4281 }).toArray();
  console.log('  Results:', raw.length);
  
  await mongoose.connection.close();
}

testMongooseQuery();
