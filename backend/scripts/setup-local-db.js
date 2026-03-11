// Setup Local MongoDB Database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  createdAt: { type: Date, default: Date.now }
});

// Book Schema
const bookSchema = new mongoose.Schema({
  accNo: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  department: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Issued'], default: 'Available' },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

async function setupDatabase() {
  try {
    console.log('🔧 Setting up local MongoDB database...');
    
    // Connect to local MongoDB
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to local MongoDB');
    
    // Create models
    const User = mongoose.model('User', userSchema);
    const Book = mongoose.model('Book', bookSchema);
    
    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    console.log('🗑️ Cleared existing data');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('buvanes', 10);
    
    const adminUser = await User.create({
      name: 'Buvanes',
      email: 'buvanese23@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('👤 Created admin user:', adminUser.email);
    
    // Create sample books
    const sampleBooks = [
      {
        accNo: 'ACC001',
        title: 'Introduction to Computer Science',
        author: 'John Doe',
        publisher: 'Tech Publications',
        publishedYear: 2023,
        department: 'SECE : COMPUTER SCIENCE & ENGG',
        status: 'Available',
        location: 'Library Shelf A1'
      },
      {
        accNo: 'ACC002',
        title: 'Advanced Engineering Mathematics',
        author: 'Jane Smith',
        publisher: 'Academic Press',
        publishedYear: 2022,
        department: 'SCIENCE AND HUMANITIES',
        status: 'Available',
        location: 'Library Shelf B2'
      },
      {
        accNo: 'ACC003',
        title: 'Digital Electronics',
        author: 'Robert Johnson',
        publisher: 'Engineering Books',
        publishedYear: 2023,
        department: 'SECE : ELECTRONICS & COMMUNICATION ENGG',
        status: 'Issued',
        location: 'Library Shelf C3'
      }
    ];
    
    const createdBooks = await Book.insertMany(sampleBooks);
    console.log('📚 Created sample books:', createdBooks.length);
    
    // Verify data
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();
    
    console.log('\n📊 Database Setup Complete:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`📚 Books: ${bookCount}`);
    console.log('\n✅ Local database ready for use!');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

setupDatabase();
