import express from 'express'
import Book from '../models/Book.js'

const router = express.Router()

/*
GET /api/locations

Returns:
[
  {
    rack: 1,
    shelves: [4, 5, 7, 59, 60]
  },
  {
    rack: 2,
    shelves: [1, 4, 5, 27, 34, 35]
  }
]
*/
router.get("/", async (req, res) => {
  try {
    const locations = await Book.aggregate([
      // 1. Normalize raw fields
      {
        $addFields: {
          rawRack: { $ifNull: ["$locationRack", "$location.rack"] },
          rawShelf: { $ifNull: ["$shelf", "$location.shelf"] }
        }
      },

      // 2. Extract numeric rack from strings like "Rack 1 - Shelf 60"
      {
        $addFields: {
          rackMatch: {
            $regexFind: {
              input: { $toString: "$rawRack" },
              regex: "(\\d+)"
            }
          }
        }
      },

      // 3. Normalize to numeric values
      {
        $addFields: {
          rackValue: {
            $cond: [
              { $isNumber: "$rawRack" },
              "$rawRack",
              {
                $cond: [
                  { $eq: ["$rackMatch", null] },
                  null,
                  { $toInt: { $arrayElemAt: ["$rackMatch.captures", 0] } }
                ]
              }
            ]
          },
          shelfValue: {
            $cond: [
              { $isNumber: "$rawShelf" },
              "$rawShelf",
              {
                $cond: [
                  { $eq: ["$rawShelf", null] },
                  null,
                  { $toInt: { $toString: "$rawShelf" } }
                ]
              }
            ]
          }
        }
      },

      // 4. Remove invalid
      {
        $match: {
          rackValue: { $ne: null },
          shelfValue: { $ne: null }
        }
      },

      // 5. Group by rack+shelf
      {
        $group: {
          _id: { rack: "$rackValue", shelf: "$shelfValue" }
        }
      },

      // 6. Sort
      {
        $sort: { "_id.rack": 1, "_id.shelf": 1 }
      },

      // 7. Regroup by rack
      {
        $group: {
          _id: "$_id.rack",
          shelves: { $push: "$_id.shelf" }
        }
      },

      // 8. Final format
      {
        $project: {
          _id: 0,
          rack: "$_id",
          shelves: 1
        }
      },

      { $sort: { rack: 1 } }
    ])

    res.json(locations)
  } catch (error) {
    console.error("Get locations error:", error)
    res.status(500).json({ message: error.message })
  }
})

export default router
