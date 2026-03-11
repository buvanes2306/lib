import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  BookOpen,
  User,
  Calendar,
  MapPin,
  Tag,
  Package
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import axios from 'axios'
import toast from 'react-hot-toast'

const BookDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`/api/books/${id}`)
        setBook(response.data.data.book)
      } catch (error) {
        console.error('Error fetching book:', error)
        toast.error('Failed to load book details')
        navigate('/books')
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id, navigate])

  const deleteBook = async () => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return
    }

    try {
      await axios.delete(`/api/books/${id}`)
      toast.success('Book deleted successfully')
      navigate('/books')
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book')
    }
  }

  const updateBookStatus = async (newStatus) => {
    try {
      await axios.patch(`/api/books/${id}/status`, { status: newStatus })
      setBook(prev => ({ ...prev, status: newStatus }))
      toast.success(`Book status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating book status:', error)
      toast.error('Failed to update book status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Book not found</h3>
        <p className="mt-1 text-sm text-gray-500">The book you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/books" className="btn btn-primary">
            Back to Books
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/books"
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Book Details</h1>
        </div>
        
        {user?.role === 'admin' && (
          <div className="flex space-x-2">
            <Link
              to={`/admin/edit/${book._id}`}
              className="btn btn-secondary inline-flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={deleteBook}
              className="btn btn-danger inline-flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
              <p className="mt-2 text-lg text-gray-600">by {book.author}</p>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-lg font-semibold rounded-full ${
                book.status === 'Available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {book.status}
              </span>
              
              {user?.role === 'admin' && (
                <div className="flex space-x-2">
                  {book.status === 'Available' ? (
                    <button
                      onClick={() => updateBookStatus('Issued')}
                      className="btn btn-secondary"
                    >
                      Mark as Issued
                    </button>
                  ) : (
                    <button
                      onClick={() => updateBookStatus('Available')}
                      className="btn btn-secondary"
                    >
                      Mark as Available
                    </button>
                  )}
                </div>
              )}
            </div>

            {book.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{book.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Accession Number</p>
                    <p className="text-gray-600">{book.accNo}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Department</p>
                    <p className="text-gray-600">{book.department}</p>
                  </div>
                </div>

                {book.publisher && (
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Publisher</p>
                      <p className="text-gray-600">{book.publisher}</p>
                    </div>
                  </div>
                )}

                {book.publishedYear && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Published Year</p>
                      <p className="text-gray-600">{book.publishedYear}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-gray-600">Rack {book.locationRack}, Shelf {book.shelf}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Call Number</p>
                    <p className="text-gray-600">{book.callNumber}</p>
                  </div>
                </div>

                {book.edition && (
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Edition</p>
                      <p className="text-gray-600">{book.edition}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-3">
                  <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Number of Copies</p>
                    <p className="text-gray-600">{book.numberOfCopies}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Book Information</h3>
              
              {book.isbn && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">ISBN</p>
                  <p className="text-gray-600">{book.isbn}</p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900">Added by</p>
                <p className="text-gray-600">{book.addedBy?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{book.addedBy?.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">Added on</p>
                <p className="text-gray-600">
                  {new Date(book.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Admin Actions</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Manage this book's information and availability.
                </p>
                <div className="space-y-2">
                  <Link
                    to={`/admin/edit/${book._id}`}
                    className="w-full btn btn-primary text-center"
                  >
                    Edit Book
                  </Link>
                  <button
                    onClick={deleteBook}
                    className="w-full btn btn-danger"
                  >
                    Delete Book
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail
