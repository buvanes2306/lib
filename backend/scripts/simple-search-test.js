// Simple Search API Test
console.log('🔍 Testing Search API...');

fetch('http://localhost:5000/api/books?search=computer')
  .then(response => {
    console.log('📥 Response status:', response.status);
    return response.text();
  })
  .then(text => {
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
            console.log(`  ${index + 1}. ${book.title} - ${book.author}`);
          });
        } else {
          console.log('📭 No books found for search term');
        }
      } else {
        console.log('❌ API response format error');
      }
    } catch (parseError) {
      console.log('❌ Parse error:', parseError.message);
    }
  })
  .catch(error => {
    console.error('❌ Test error:', error.message);
  });
