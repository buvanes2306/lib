import mongoose from 'mongoose'

const auditReportSchema = new mongoose.Schema({
  auditSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditSession',
    required: true
  },
  bookId: {
    type: String,
    required: true
  },
  accNo: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  expectedRack: {
    type: Number,
    required: true
  },
  expectedShelf: {
    type: Number,
    required: true
  },
  actualRack: {
    type: Number,
    required: true
  },
  actualShelf: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['found', 'missing', 'misplaced'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.model('AuditReport', auditReportSchema)
