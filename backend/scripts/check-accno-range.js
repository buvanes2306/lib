// Check books with accNo in 17000 range
import mongoose from 'mongoose';

async function checkAccNo() {
  await mongoose.connect('mongodb://localhost:27017/librarydb');
  
  // Find books with accNo containing numbers around 17000
  const books = await mongoose.connection.collection('books')
    .find({ accNo: { $regex: /^1[67]/ } })
    .sort({ accNo: 1 })
    .toArray();
  
  console.log('Books with accNo starting with 1[67]:', books.length);
  books.forEach((book, i) => {
    console.log(`${i+1}. accNo: ${book.accNo}, title: ${book.title}`);
  });
  
  // Also check if there's exact match for 17106
  const exact17106 = await mongoose.connection.collection('books')
    .findOne({ accNo: "17106" });
  console.log('\nExact match for 17106:', exact17106 ? 'Found: ' + exact17106.title : 'Not found');
  
  await mongoose.connection.close();
}

checkAccNo();
