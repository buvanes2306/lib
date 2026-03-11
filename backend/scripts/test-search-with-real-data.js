// Test search with real book data
async function testSearchWithRealData() {
  try {
    console.log('🔍 Testing search with real book data...');
    
    // Test search for "operation" (from the book title)
    console.log('\n🔍 Testing search for "operation"...');
    const response = await fetch('http://localhost:5000/api/books?search=operation');
    
    const text = await response.text();
    console.log('📥 API response status:', response.status);
    
    if (response.ok) {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ Search API working!');
        console.log('📚 Books found:', data.data.books.length);
        
        if (data.data.books.length > 0) {
          console.log('\n📋 Books found:');
          data.data.books.forEach((book, index) => {
            const authorDisplay = book.author || (book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'N/A');
            console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
            console.log(`     Author: ${authorDisplay}`);
            console.log(`     Publisher: ${book.publisher}`);
          });
        } else {
          console.log('\n📭 No books found for "operation"');
        }
      } else {
        console.log('❌ API response format error');
      }
    } else {
      console.log('❌ API request failed');
    }
    
    // Test search for "hillier" (from the authors)
    console.log('\n🔍 Testing search for "hillier"...');
    const response2 = await fetch('http://localhost:5000/api/books?search=hillier');
    
    const text2 = await response2.text();
    console.log('📥 API response status:', response2.status);
    
    if (response2.ok) {
      const data2 = JSON.parse(text2);
      if (data2.success) {
        console.log('✅ Search API working!');
        console.log('📚 Books found:', data2.data.books.length);
        
        if (data2.data.books.length > 0) {
          console.log('\n📋 Books found:');
          data2.data.books.forEach((book, index) => {
            const authorDisplay = book.author || (book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'N/A');
            console.log(`  ${index + 1}. ${book.title} - ${book.accNo}`);
            console.log(`     Author: ${authorDisplay}`);
          });
        } else {
          console.log('\n📭 No books found for "hillier"');
        }
      } else {
        console.log('❌ API response format error');
      }
    } else {
      console.log('❌ API request failed');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSearchWithRealData();
