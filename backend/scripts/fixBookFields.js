import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Book from '../models/Book.js'

dotenv.config()

await mongoose.connect(process.env.MONGODB_URI)

console.log("Connected to DB...")

// Get all books
const books = await Book.find()

console.log(`Found ${books.length} books to fix...`)

let fixedCount = 0

for (let book of books) {
  const bookObj = book.toObject()
  const updates = {}
  const unsetFields = {}
  
  // Check and fix each field
  if (bookObj["Acc no"] && !bookObj.accNo) {
    updates.accNo = bookObj["Acc no"]
    unsetFields["Acc no"] = 1
    console.log(`✅ Fixed accNo: ${bookObj["Acc no"]}`)
  }
  
  if (bookObj["Title"] && !bookObj.title) {
    updates.title = bookObj["Title"]
    unsetFields["Title"] = 1
    console.log(`✅ Fixed title: ${bookObj["Title"]}`)
  }
  
  if (bookObj["Author"] && !bookObj.author) {
    updates.author = bookObj["Author"]
    unsetFields["Author"] = 1
    console.log(`✅ Fixed author: ${bookObj["Author"]}`)
  }
  
  if (bookObj["Publisher"] && !bookObj.publisher) {
    updates.publisher = bookObj["Publisher"]
    unsetFields["Publisher"] = 1
    console.log(`✅ Fixed publisher: ${bookObj["Publisher"]}`)
  }
  
  if (bookObj["Published Year"] && !bookObj.publishedYear) {
    updates.publishedYear = bookObj["Published Year"]
    unsetFields["Published Year"] = 1
    console.log(`✅ Fixed publishedYear: ${bookObj["Published Year"]}`)
  }
  
  if (bookObj["Department"] && !bookObj.department) {
    updates.department = bookObj["Department"]
    unsetFields["Department"] = 1
    console.log(`✅ Fixed department: ${bookObj["Department"]}`)
  }
  
  if (bookObj["Location Rack, Shelf"] && (!bookObj.locationRack || !bookObj.shelf)) {
    const location = bookObj["Location Rack, Shelf"]
    const parts = location.split(',').map(s => s.trim())
    updates.locationRack = parts[0] || ''
    updates.shelf = parts[1] || ''
    unsetFields["Location Rack, Shelf"] = 1
    console.log(`✅ Fixed location: Rack: ${updates.locationRack}, Shelf: ${updates.shelf}`)
  }
  
  if (bookObj["Call number"] && !bookObj.callNumber) {
    updates.callNumber = bookObj["Call number"]
    unsetFields["Call number"] = 1
    console.log(`✅ Fixed callNumber: ${bookObj["Call number"]}`)
  }
  
  if (bookObj["Edition"] && !bookObj.edition) {
    updates.edition = bookObj["Edition"]
    unsetFields["Edition"] = 1
    console.log(`✅ Fixed edition: ${bookObj["Edition"]}`)
  }
  
  if (bookObj["No. of. Copies"] && !bookObj.numberOfCopies) {
    updates.numberOfCopies = bookObj["No. of. Copies"]
    unsetFields["No. of. Copies"] = 1
    console.log(`✅ Fixed numberOfCopies: ${bookObj["No. of. Copies"]}`)
  }
  
  if (bookObj["Status"] && !bookObj.status) {
    updates.status = bookObj["Status"]
    unsetFields["Status"] = 1
    console.log(`✅ Fixed status: ${bookObj["Status"]}`)
  }
  
  // Apply updates if there are any
  if (Object.keys(updates).length > 0) {
    updates.$unset = unsetFields
    await Book.updateOne({ _id: book._id }, updates)
    fixedCount++
  }
}

console.log(`\n✅ Fixed ${fixedCount} books`)

// Show sample
const sample = await Book.findOne()
if (sample) {
  console.log("\n📖 Sample book structure:")
  console.log(JSON.stringify(sample.toObject(), null, 2))
}

process.exit()
