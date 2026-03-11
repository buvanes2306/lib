// Test API with actual accNo
async function testAPIAccNo() {
  try {
    // Test with search=4281 (which exists in DB)
    const response = await fetch('http://localhost:5000/api/books?search=4281');
    const data = await response.json();
    console.log('API with search=4281:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPIAccNo();
