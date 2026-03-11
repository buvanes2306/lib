import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

console.log('🔍 DATABASE CHECK')
console.log('================')
console.log('Database:', mongoose.connection.name)
console.log('Connection:', mongoose.connection.host)

// Get all collections
const collections = await mongoose.connection.db.listCollections().toArray()
console.log('\n📁 Collections:')
collections.forEach(collection => {
  console.log(`  - ${collection.name}`)
})

// Check users collection
console.log('\n👥 USERS COLLECTION:')
const usersCount = await mongoose.connection.db.collection('users').countDocuments()
console.log(`Total users: ${usersCount}`)

if (usersCount > 0) {
  const users = await mongoose.connection.db.collection('users').find({}).toArray()
  console.log('\nUsers:')
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
    console.log(`     Created: ${user.createdAt}`)
    console.log(`     ID: ${user._id}`)
  })
}

// Check books collection
console.log('\n📚 BOOKS COLLECTION:')
const booksCount = await mongoose.connection.db.collection('books').countDocuments()
console.log(`Total books: ${booksCount}`)

if (booksCount > 0) {
  const sampleBooks = await mongoose.connection.db.collection('books').find({}).limit(3).toArray()
  console.log('\nSample books:')
  sampleBooks.forEach((book, index) => {
    console.log(`  ${index + 1}. ${book.title} by ${book.author}`)
    console.log(`     Accession No: ${book.accNo}`)
    console.log(`     ID: ${book._id}`)
  })
}

console.log('\n✅ Database check complete!')

process.exit()
