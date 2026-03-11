// Check actual data structure
import mongoose from 'mongoose';

async function checkStructure() {
  await mongoose.connect('mongodb://localhost:27017/librarydb');
  
  // Get raw sample of first book
  const sample = await mongoose.connection.collection('books').findOne({});
  
  console.log('Keys in first book document:');
  console.log(Object.keys(sample));
  
  console.log('\nFull first document:');
  console.log(JSON.stringify(sample, null, 2));
  
  await mongoose.connection.close();
}

checkStructure();
