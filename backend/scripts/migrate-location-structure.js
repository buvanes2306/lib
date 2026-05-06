import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Book from '../models/Book.js'

dotenv.config()

async function migrateLocationStructure() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('📚 Connected to MongoDB...\n')

    // 1. Find books with nested location object
    const booksWithNestedLocation = await Book.find({
      'location': { $exists: true, $type: 'object' }
    })

    console.log(`🔍 Found ${booksWithNestedLocation.length} books with nested location structure\n`)

    let migratedCount = 0
    let skippedCount = 0

    for (const book of booksWithNestedLocation) {
      const bookObj = book.toObject()
      
      if (bookObj.location && typeof bookObj.location === 'object') {
        const rack = String(bookObj.location.rack || '').trim()
        const shelf = String(bookObj.location.shelf || '').trim()

        if (rack || shelf) {
          // Update book with flat location fields and remove nested object
          await Book.updateOne(
            { _id: book._id },
            {
              $set: {
                locationRack: rack || '0',
                shelf: shelf || '0'
              },
              $unset: {
                location: 1  // Remove the nested location field
              }
            }
          )
          console.log(`✅ [${book.accNo}] "${book.title}" -> Rack: ${rack}, Shelf: ${shelf}`)
          migratedCount++
        } else {
          console.log(`⚠️  [${book.accNo}] "${book.title}" -> Skipped (empty location values)`)
          skippedCount++
        }
      }
    }

    // 2. Find books missing BOTH locationRack and shelf
    const booksWithoutLocation = await Book.find({
      $or: [
        { locationRack: { $exists: false } },
        { shelf: { $exists: false } },
        { locationRack: null },
        { shelf: null },
        { locationRack: '' },
        { shelf: '' }
      ]
    })

    console.log(`\n🔍 Found ${booksWithoutLocation.length} books with missing location fields\n`)

    let fixedCount = 0

    for (const book of booksWithoutLocation) {
      const bookObj = book.toObject()
      
      // Try to extract from nested location if it still exists
      if (bookObj.location && typeof bookObj.location === 'object') {
        const rack = String(bookObj.location.rack || '1').trim()
        const shelf = String(bookObj.location.shelf || '0').trim()
        
        await Book.updateOne(
          { _id: book._id },
          {
            $set: {
              locationRack: rack,
              shelf: shelf
            },
            $unset: {
              location: 1
            }
          }
        )
        console.log(`✅ [${book.accNo}] "${book.title}" -> Fixed: Rack: ${rack}, Shelf: ${shelf}`)
        fixedCount++
      } else if (!bookObj.locationRack || !bookObj.shelf) {
        // Set default values if no location data exists
        await Book.updateOne(
          { _id: book._id },
          {
            $set: {
              locationRack: bookObj.locationRack || '1',
              shelf: bookObj.shelf || '0'
            }
          }
        )
        console.log(`⚠️  [${book.accNo}] "${book.title}" -> Set defaults: Rack: 1, Shelf: 0`)
        fixedCount++
      }
    }

    console.log(`\n📊 Migration Summary:`)
    console.log(`   ✅ Migrated (nested → flat): ${migratedCount}`)
    console.log(`   ✅ Fixed (missing fields): ${fixedCount}`)
    console.log(`   ⚠️  Skipped: ${skippedCount}`)
    console.log(`\n✨ Migration completed!\n`)

    await mongoose.connection.close()
  } catch (error) {
    console.error('❌ Migration error:', error)
    await mongoose.connection.close()
    process.exit(1)
  }
}

migrateLocationStructure()
