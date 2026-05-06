import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Book from '../models/Book.js'

dotenv.config()

async function verifyLocationData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🔍 Verifying location data...\n')

    // Check books with proper location data
    const booksWithLocation = await Book.find({
      locationRack: { $exists: true, $ne: null, $ne: '' },
      shelf: { $exists: true, $ne: null, $ne: '' }
    }).select('bookId accNo title locationRack shelf location').limit(10)

    console.log('📚 Sample of books WITH proper location data:')
    booksWithLocation.forEach(book => {
      const nested = book.location ? ` (nested: ${JSON.stringify(book.location)})` : ''
      console.log(`   [${book.accNo}] "${book.title}" -> Rack: ${book.locationRack}, Shelf: ${book.shelf}${nested}`)
    })

    // Check for books with missing location
    const booksWithoutLocation = await Book.find({
      $or: [
        { locationRack: { $exists: false } },
        { shelf: { $exists: false } },
        { locationRack: null },
        { shelf: null },
        { locationRack: '' },
        { shelf: '' }
      ]
    }).select('bookId accNo title locationRack shelf location').limit(10)

    console.log(`\n⚠️  Books WITHOUT proper location data: ${booksWithoutLocation.length}`)
    if (booksWithoutLocation.length > 0) {
      console.log('Sample of problematic books:')
      booksWithoutLocation.forEach(book => {
        const nested = book.location ? ` (nested: ${JSON.stringify(book.location)})` : ''
        console.log(`   [${book.accNo}] "${book.title}" -> Rack: ${book.locationRack}, Shelf: ${book.shelf}${nested}`)
      })
    }

    // Check for books with nested location object
    const booksWithNested = await Book.find({
      'location': { $exists: true, $type: 'object' }
    }).select('bookId accNo title locationRack shelf location').limit(10)

    console.log(`\n📍 Books with nested location object: ${booksWithNested.length}`)
    if (booksWithNested.length > 0) {
      console.log('Sample:')
      booksWithNested.forEach(book => {
        console.log(`   [${book.accNo}] "${book.title}" -> Nested: ${JSON.stringify(book.location)}, Flat: Rack: ${book.locationRack}, Shelf: ${book.shelf}`)
      })
    }

    // Summary statistics
    const totalBooks = await Book.countDocuments()
    const validBooks = await Book.countDocuments({
      locationRack: { $exists: true, $ne: null, $ne: '' },
      shelf: { $exists: true, $ne: null, $ne: '' }
    })

    console.log(`\n📊 Summary:`)
    console.log(`   Total books: ${totalBooks}`)
    console.log(`   Books with valid location: ${validBooks}`)
    console.log(`   Books with missing location: ${totalBooks - validBooks}`)
    console.log(`   Completion: ${((validBooks / totalBooks) * 100).toFixed(1)}%`)

    if (validBooks === totalBooks) {
      console.log('\n✅ All books have proper location data!')
    } else {
      console.log('\n⚠️  Some books still need location data fix')
    }

    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Verification error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

verifyLocationData()
