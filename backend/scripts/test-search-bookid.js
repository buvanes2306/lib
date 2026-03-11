// Test search with bookId
async function testSearchWithBookId() {
  try {
    console.log('🔍 Testing search with bookId...');
    
    // Test search for "00018" (bookId from your sample data)
    console.log('\n🔍 Testing search for "00018"...');
    const response = await fetch('http://localhost:5000/api/books?search=00018');
    
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
            console.log(`  ${index + 1}. Book ID: ${book.bookId || 'N/A'} - AccNo: ${book.accNo}`);
            console.log(`     Title: ${book.title}`);
            console.log(`     Author: ${authorDisplay}`);
          });
        } else {
          console.log('\n📭 No books found for "00018"');
        }
      } else {
        console.log('❌ API response format error');
      }
    } else {
      console.log('❌ API request failed');
    }
    
    // Test search for "18" (partial bookId)
    console.log('\n🔍 Testing search for "18"...');
    const response2 = await fetch('http://localhost:5000/api/books?search=18');
    
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
            console.log(`  ${index + 1}. Book ID: ${book.bookId || 'N/A'} - AccNo: ${book.accNo}`);
            console.log(`     Title: ${book.title}`);
            console.log(`     Author: ${authorDisplay}`);
          });
        } else {
          console.log('\n📭 No books found for "18"');
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

testSearchWithBookId();
