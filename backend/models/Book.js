import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    trim: true,
    uppercase: true
  },
  accNo: {
    type: String,
    required: [true, 'Accession number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  authors: {
    type: [String],
    default: []
  },
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher name cannot exceed 100 characters']
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'Issued'],
    default: 'Available'
  },
  locationRack: {
    type: String,
    required: [true, 'Location rack is required'],
    trim: true
  },
  shelf: {
    type: String,
    required: [true, 'Shelf is required'],
    trim: true
  },
  callNumber: {
    type: String,
    required: [true, 'Call number is required'],
    trim: true
  },
  edition: {
    type: String,
    trim: true
  },
  numberOfCopies: {
    type: Number,
    required: [true, 'Number of copies is required'],
    min: [1, 'There must be at least 1 copy'],
    default: 1
  },
  isbn: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v || v === '') return true;
        return /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
      },
      message: 'Please enter a valid ISBN'
    }
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text', authors: 'text', publisher: 'text' });
bookSchema.index({ department: 1 });
bookSchema.index({ status: 1 });

// Schema guard to prevent future corruption
bookSchema.pre("save", function (next) {
  if (this.locationRack != null) {
    const match = String(this.locationRack).match(/(\d+)/)
    if (match) {
      this.locationRack = parseInt(match[1], 10)
    }
  }

  if (this.shelf != null) {
    const match = String(this.shelf).match(/(\d+)/)
    if (match) {
      this.shelf = parseInt(match[1], 10)
    }
  }

  next()
})

export default mongoose.model('Book', bookSchema);
