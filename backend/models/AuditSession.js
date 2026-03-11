import mongoose from 'mongoose'

const auditSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  totalBooksScanned: {
    type: Number,
    default: 0
  },
  booksFound: {
    type: Number,
    default: 0
  },
  booksMissing: {
    type: Number,
    default: 0
  },
  booksMisplaced: {
    type: Number,
    default: 0
  },
  auditor: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

export default mongoose.model('AuditSession', auditSessionSchema)
