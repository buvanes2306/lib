// Direct MongoDB test for accNo search
import mongoose from 'mongoose';

async function testDirectMongo() {
  await mongoose.connect('mongodb://localhost:27017/librarydb');
  
  const collection = mongoose.connection.collection('books');
  
  // Test 1: Find exact accNo as number
  console.log('Test 1: Find with accNo = 4281 (number)');
  const test1 = await collection.find({ accNo: 4281 }).toArray();
  console.log('  Results:', test1.length);
  if (test1.length > 0) console.log('  First:', test1[0].accNo, typeof test1[0].accNo);
  
  // Test 2: Find with regex on accNo
  console.log('\nTest 2: Find with accNo regex /4281/');
  const test2 = await collection.find({ accNo: { $regex: '4281' } }).toArray();
  console.log('  Results:', test2.length);
  
  // Test 3: Find with regex on accNo as string
  console.log('\nTest 3: Find with accNo regex /4281/i');
  const test3 = await collection.find({ accNo: { $regex: '4281', $options: 'i' } }).toArray();
  console.log('  Results:', test3.length);
  
  // Test 4: $or query like the controller
  console.log('\nTest 4: $or query');
  const test4 = await collection.find({
    $or: [
      { title: { $regex: '4281', $options: 'i' } },
      { accNo: 4281 }
    ]
  }).toArray();
  console.log('  Results:', test4.length);
  
  // Check data types in collection
  console.log('\n--- Checking data types ---');
  const sample = await collection.find().limit(3).toArray();
  sample.forEach((doc, i) => {
    console.log(`${i+1}. accNo: ${doc.accNo} (type: ${typeof doc.accNo})`);
  });
  
  await mongoose.connection.close();
}

testDirectMongo();
