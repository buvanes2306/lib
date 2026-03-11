import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Book from '../models/Book.js'

dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

console.log("Connected to DB...")

const books = await Book.find()

console.log(`Found ${books.length} books to migrate...`)

for (let book of books) {
  console.log(`Migrating book: ${book._id}`)
  
  // Map old fields to new fields
  const updates = {}
  
  if (book["Acc no"]) {
    updates.accNo = book["Acc no"]
    updates.$unset = { "Acc no": 1 }
  }
  
  if (book["Title"]) {
    updates.title = book["Title"]
    updates.$unset = { ...updates.$unset, "Title": 1 }
  }
  
  if (book["Author"]) {
    updates.author = book["Author"]
    updates.$unset = { ...updates.$unset, "Author": 1 }
  }
  
  if (book["Publisher"]) {
    updates.publisher = book["Publisher"]
    updates.$unset = { ...updates.$unset, "Publisher": 1 }
  }
  
  if (book["Published Year"]) {
    updates.publishedYear = book["Published Year"]
    updates.$unset = { ...updates.$unset, "Published Year": 1 }
  }
  
  if (book["Department"]) {
    updates.department = book["Department"]
    updates.$unset = { ...updates.$unset, "Department": 1 }
  }
  
  if (book["Location Rack, Shelf"]) {
    // Parse location into rack and shelf
    const location = book["Location Rack, Shelf"]
    const parts = location.split(',').map(s => s.trim())
    updates.locationRack = parts[0] || ''
    updates.shelf = parts[1] || ''
    updates.$unset = { ...updates.$unset, "Location Rack, Shelf": 1 }
  }
  
  if (book["Call number"]) {
    updates.callNumber = book["Call number"]
    updates.$unset = { ...updates.$unset, "Call number": 1 }
  }
  
  if (book["Edition"]) {
    updates.edition = book["Edition"]
    updates.$unset = { ...updates.$unset, "Edition": 1 }
  }
  
  if (book["No. of. Copies"]) {
    updates.numberOfCopies = book["No. of. Copies"]
    updates.$unset = { ...updates.$unset, "No. of. Copies": 1 }
  }
  
  if (book["Status"]) {
    updates.status = book["Status"]
    updates.$unset = { ...updates.$unset, "Status": 1 }
  }
  
  // Apply updates
  await Book.updateOne({ _id: book._id }, updates)
  
  console.log(`✅ Migrated: ${book["Title"] || book.title || 'Unknown'} -> accNo: ${updates.accNo || book.accNo}`)
}

console.log("Migration completed ✅")

// Verify migration
const updatedBooks = await Book.find()
console.log(`Verification: ${updatedBooks.length} books after migration`)

// Show a sample book
if (updatedBooks.length > 0) {
  const sample = updatedBooks[0]
  console.log("Sample book structure:")
  console.log(JSON.stringify(sample.toObject(), null, 2))
}

process.exit()
