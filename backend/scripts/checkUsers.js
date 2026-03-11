import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Count users
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log('👥 Total users in database:', usersCount);

    // Get user details
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('\n📋 User List:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    // Check for duplicate emails
    const emails = users.map(user => user.email.toLowerCase());
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    if (duplicates.length > 0) {
      console.log('⚠️  Duplicate emails found:', duplicates);
    } else {
      console.log('✅ No duplicate emails found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkUsers();
