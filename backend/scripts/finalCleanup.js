import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

console.log("Connected to DB...")

// Direct MongoDB operation
const result = await mongoose.connection.db.collection('books').updateMany(
  {},
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
const sample = await mongoose.connection.db.collection('books').findOne({})
console.log("\n📖 Final book structure:")
console.log(JSON.stringify(sample, null, 2))

process.exit()
