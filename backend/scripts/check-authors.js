// Check book authors
import mongoose from 'mongoose';
import Book from '../models/Book.js';

async function checkAuthors() {
  try {
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    const books = await Book.find({}).limit(5).select('title author authors');
    console.log('Sample books:');
    books.forEach(book => {
      console.log(`Title: ${book.title}`);
      console.log(`Author: ${book.author}`);
      console.log(`Authors: ${book.authors}`);
      console.log('---');
    });
    mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkAuthors();