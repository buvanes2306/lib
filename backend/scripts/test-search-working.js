// Test search with a known term
import mongoose from 'mongoose';

async function testSearch() {
  await mongoose.connect('mongodb://localhost:27017/librarydb');
  
  const Book = mongoose.model('Book', new mongoose.Schema({}, { collection: 'books' }));
  
  // Test search for "Information" - should find "Information Technology"
  const results = await Book.find({
    $or: [
      { title: { $regex: 'Information', $options: 'i' } },
      { author: { $regex: 'Information', $options: 'i' } },
      { accNo: { $regex: 'Information', $options: 'i' } }
    ]
  });
  
  console.log('Search for "Information":', results.length, 'books found');
  results.forEach((book, i) => {
    console.log(`  ${i+1}. ${book.title} (accNo: ${book.accNo})`);
  });
  
  // Test search for "4281"
  const results2 = await Book.find({
    $or: [
      { title: { $regex: '4281', $options: 'i' } },
      { author: { $regex: '4281', $options: 'i' } },
      { accNo: { $regex: '4281', $options: 'i' } }
    ]
  });
  
  console.log('\nSearch for "4281":', results2.length, 'books found');
  results2.forEach((book, i) => {
    console.log(`  ${i+1}. ${book.title} (accNo: ${book.accNo})`);
  });
  
  await mongoose.connection.close();
}

testSearch();
