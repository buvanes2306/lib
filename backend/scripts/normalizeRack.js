import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Book from '../models/Book.js'

dotenv.config()

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)

  const books = await Book.find({
    locationRack: { $type: "string" }
  })

  let updated = 0

  for (const book of books) {
    const match = book.locationRack.match(/(\d+)/)
    if (match) {
      book.locationRack = parseInt(match[1], 10)
      await book.save()
      updated++
    }
  }

  console.log("Updated:", updated)
  await mongoose.disconnect()
}

run()
