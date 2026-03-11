// Check all books in database
import mongoose from 'mongoose';

async function checkBooks() {
  await mongoose.connect('mongodb://localhost:27017/librarydb');
  
  const count = await mongoose.connection.collection('books').countDocuments();
  console.log('Total books in database:', count);
  
  const sample = await mongoose.connection.collection('books').find().limit(5).toArray();
  console.log('\nSample books:');
  sample.forEach((book, i) => {
    console.log(`\n${i+1}. accNo: ${book.accNo}`);
    console.log(`   title: ${book.title}`);
    console.log(`   author: ${book.author}`);
  });
  
  await mongoose.connection.close();
}

checkBooks();
