import fetch from 'node-fetch';

async function testAPIEndpoint() {
  try {
    console.log('🔍 Testing API endpoint: http://localhost:5002/api/books?publishedYear=2010&limit=5');
    
    const response = await fetch('http://localhost:5002/api/books?publishedYear=2010&limit=5');
    const data = await response.json();
    
    console.log('📊 API Response:', data);
    
    if (data.success) {
      console.log('✅ Books found:', data.data.books.length);
      data.data.books.forEach((book, index) => {
        console.log(`${index + 1}. ${book.title} - Year: ${book.publishedYear} - Dept: ${book.department}`);
      });
    } else {
      console.log('❌ API call failed');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAPIEndpoint();
