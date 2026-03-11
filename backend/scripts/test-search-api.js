// Test Search API with built-in fetch
async function testSearchAPI() {
  try {
    console.log('🔍 Testing Search API...');
    
    // Test search API
    const response = await fetch('http://localhost:5000/api/books?search=computer');
    
    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('📥 Response text:', text.substring(0, 300) + '...');
      
      try {
        const data = JSON.parse(text);
        if (data.success) {
          console.log('✅ Search API working!');
          console.log('📚 Books found:', data.data.books.length);
          console.log('📊 Total books:', data.data.pagination.total);
          
          if (data.data.books.length > 0) {
            console.log('📋 Sample books:');
            data.data.books.slice(0, 3).forEach((book, index) => {
              console.log(`  ${index + 1}. ${book.title} - ${book.authors ? book.authors.join(', ') : 'N/A'}`);
            });
          }
        } else {
          console.log('📭 No books found for search term');
        }
      } catch (parseError) {
        console.log('❌ Parse error:', parseError.message);
      }
    } else {
      console.log('❌ API response not ok:', response.status);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSearchAPI();
