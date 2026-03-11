// Test the actual registration API endpoint using built-in fetch

async function testRegisterAPI() {
  try {
    console.log('🔍 Testing registration API endpoint...');
    
    const userData = {
      name: 'API Test User',
      email: 'apitest' + Date.now() + '@example.com',
      password: 'password123',
      role: 'viewer'
    };
    
    console.log('📤 Sending data:', { ...userData, password: '***' });
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📥 Raw response:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('📊 Parsed data:', data);
      
      if (data.success) {
        console.log('✅ Registration successful via API!');
      } else {
        console.log('❌ Registration failed via API:', data.message);
      }
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}

testRegisterAPI();
