import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Book from '../models/Book.js'

dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

console.log("Connected to DB...")

// Remove all old fields
const result = await Book.updateMany(
  {}, // Match all documents
  {
    $unset: {
      "Acc no": 1,
      "Title": 1,
      "Author": 1,
      "Publisher": 1,
      "Published Year": 1,
      "Department": 1,
      "Status": 1,
      "Location Rack, Shelf": 1,
      "Call number": 1,
      "Edition": 1,
      "No. of. Copies": 1
    }
  }
)

console.log(`✅ Cleaned up old fields from ${result.modifiedCount} books`)

// Show final sample
const sample = await Book.findOne()
if (sample) {
  console.log("\n📖 Final book structure:")
  console.log(JSON.stringify(sample.toObject(), null, 2))
}

process.exit()
