// Check all unique accNo patterns
import mongoose from 'mongoose';

async function checkAccNoRange() {
  await mongoose.connect('mongodb://localhost:27017/librarydb');
  
  // Get all accNo sorted
  const books = await mongoose.connection.collection('books')
    .find({}, { accNo: 1 })
    .sort({ accNo: 1 })
    .toArray();
  
  console.log('Total books:', books.length);
  console.log('\nFirst 20 accNo:');
  books.slice(0, 20).forEach((book, i) => {
    console.log(`${i+1}. ${book.accNo}`);
  });
  
  console.log('\nLast 20 accNo:');
  books.slice(-20).forEach((book, i) => {
    console.log(`${books.length - 20 + i + 1}. ${book.accNo}`);
  });
  
  // Check for accNo containing numbers (not just 4-digit)
  const accNoWithPrefix = books.filter(b => !/^\d{4}$/.test(b.accNo));
  console.log('\nBooks with non-standard accNo (not 4 digits):', accNoWithPrefix.length);
  if (accNoWithPrefix.length > 0) {
    accNoWithPrefix.slice(0, 10).forEach(b => console.log(`  - ${b.accNo}`));
  }
  
  await mongoose.connection.close();
}

checkAccNoRange();
