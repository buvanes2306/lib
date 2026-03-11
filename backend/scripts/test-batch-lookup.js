import fetch from 'node-fetch';

async function testBatchLookup() {
  try {
    console.log('🔍 Testing batch lookup endpoint...');
    
    // Test with real bookId values from database
    const testCodes = ['00001', '00002', '00003'];
    
    const response = await fetch('http://localhost:5002/api/books/batch-lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ codes: testCodes })
    });
    
    const data = await response.json();
    
    console.log('📡 API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Batch lookup working!');
      console.log(`📊 Results: ${data.data.found} found, ${data.data.missing} missing`);
    } else {
      console.log('❌ Batch lookup failed');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testBatchLookup();
