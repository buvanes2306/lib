// Check all collections in the database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllCollections() {
  try {
    console.log('🔍 Checking all collections in database...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/librarydb');
    console.log('✅ Connected to database');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collections:`);
    
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check each collection for book data
    for (const collection of collections) {
      console.log(`\n🔍 Checking collection: ${collection.name}`);
      
      try {
        const model = mongoose.model(collection.name, new mongoose.Schema({}, { collection: collection.name }));
        const count = await model.countDocuments();
        console.log(`  📊 Documents: ${count}`);
        
        if (count > 0) {
          const sample = await model.findOne({});
          console.log(`  📋 Sample document keys: ${Object.keys(sample.toObject())}`);
          
          // Check if it has book-like fields
          const hasBookFields = ['title', 'accNo', 'author', 'department', 'status'].some(field => 
            sample[field] && sample[field] !== 'undefined' && sample[field] !== undefined
          );
          
          if (hasBookFields) {
            console.log(`  ✅ This collection has book data!`);
            
            // Get unique departments from this collection
            const allDocs = await model.find({});
            const departments = [...new Set(allDocs.map(doc => doc.department).filter(dept => dept && dept !== 'undefined'))];
            const statuses = [...new Set(allDocs.map(doc => doc.status).filter(status => status && status !== 'undefined'))];
            
            if (departments.length > 0) {
              console.log(`  🏢 Departments: ${departments.join(', ')}`);
            }
            if (statuses.length > 0) {
              console.log(`  📊 Statuses: ${statuses.join(', ')}`);
            }
          }
        }
      } catch (error) {
        console.log(`  ❌ Error checking collection: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

checkAllCollections();
