import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from './models/Book.js';

dotenv.config();

async function checkBooks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const books = await Book.find({}).limit(5);
    console.log(`\n📚 Total books: ${await Book.countDocuments()}`);
    console.log('\n📋 Sample books:');
    books.forEach((book, i) => {
      console.log(`${i + 1}. accNo: "${book.accNo}" | title: "${book.title}"`);
    });
    
    const book17106 = await Book.findOne({ accNo: /1024/i });
    console.log(`\n🔍 Book with "": ${book17106 ? 'FOUND' : 'NOT FOUND'}`);
    if (book17106) {
      console.log(`   accNo: "${book17106.accNo}"`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkBooks();
