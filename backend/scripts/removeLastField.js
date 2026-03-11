import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

console.log("Connected to DB...")

// Remove the last old field
const result = await mongoose.connection.db.collection('books').updateMany(
  {},
  { $unset: { "No. of. Copies": 1 } }
)

console.log(`✅ Removed last old field from ${result.modifiedCount} books`)

// Show final sample
const sample = await mongoose.connection.db.collection('books').findOne({})
console.log("\n📖 Clean book structure:")
console.log(JSON.stringify(sample, null, 2))

process.exit()
