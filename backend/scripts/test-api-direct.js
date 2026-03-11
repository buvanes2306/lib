// Test API directly using fetch
async function testAPI() {
  try {
    // Test without search
    const response1 = await fetch('http://localhost:5000/api/books');
    const data1 = await response1.json();
    console.log('API without search:', JSON.stringify(data1, null, 2));
    
    // Test with search
    const response2 = await fetch('http://localhost:5000/api/books?search=Information');
    const data2 = await response2.json();
    console.log('\nAPI with search=Information:', JSON.stringify(data2, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
