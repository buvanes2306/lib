import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Save, 
  X, 
  Plus,
  ArrowLeft
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import axios from 'axios'
import toast from 'react-hot-toast'

const AdminPanel = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  
  const [formData, setFormData] = useState({
    bookId: '',
    accNo: '',
    title: '',
    author: '',
    publisher: '',
    publishedYear: '',
    department: 'Computer Science',
    status: 'Available',
    locationRack: '',
    shelf: '',
    callNumber: '',
    edition: '',
    numberOfCopies: 1,
    isbn: '',
    description: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)

  const departments = [
    'Computer Science',
    'Electrical',
    'Mechanical',
    'Civil',
    'Electronics',
    'General',
    'Reference'
  ]

  useEffect(() => {
    if (isEditing) {
      const fetchBook = async () => {
        try {
          const response = await axios.get(`/api/books/${id}`)
          const book = response.data.data.book
          setFormData({
            bookId: book.bookId || '',
            accNo: book.accNo,
            title: book.title,
            author: book.author,
            publisher: book.publisher || '',
            publishedYear: book.publishedYear || '',
            department: book.department,
            status: book.status,
            locationRack: book.locationRack,
            shelf: book.shelf,
            callNumber: book.callNumber,
            edition: book.edition || '',
            numberOfCopies: book.numberOfCopies,
            isbn: book.isbn || '',
            description: book.description || ''
          })
        } catch (error) {
          console.error('Error fetching book:', error)
          toast.error('Failed to load book details')
          navigate('/admin')
        } finally {
          setFetchLoading(false)
        }
      }

      fetchBook()
    }
  }, [id, isEditing, navigate])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clean data - remove empty strings and system fields
      const cleanData = { ...formData }
      if (!cleanData.publisher) delete cleanData.publisher
      if (!cleanData.publishedYear) delete cleanData.publishedYear
      if (!cleanData.edition) delete cleanData.edition
      if (!cleanData.isbn) delete cleanData.isbn
      if (!cleanData.description) delete cleanData.description
      
      // Remove system fields that shouldn't be updated
      delete cleanData._id
      delete cleanData.id
      delete cleanData.addedBy
      delete cleanData.createdAt
      delete cleanData.updatedAt
      delete cleanData.__v

      console.log('Sending data:', cleanData)

      if (isEditing) {
        const response = await axios.put(`/api/books/${id}`, cleanData)
        console.log('Update response:', response.data)
        toast.success('Book updated successfully')
      } else {
        await axios.post('/api/books', cleanData)
        toast.success('Book added successfully')
      }
      navigate('/books')
    } catch (error) {
      console.error('Error saving book:', error)
      console.error('Error response:', error.response?.data)
      console.error('Errors array:', error.response?.data?.errors)
      const message = error.response?.data?.message || 'Failed to save book'
      const errors = error.response?.data?.errors
      
      if (errors && Array.isArray(errors)) {
        errors.forEach(err => console.log('Validation error:', err))
        const errorMessages = errors.map(e => e.message || e.msg).join(', ')
        toast.error(errorMessages)
      } else if (errors && typeof errors === 'object') {
        const errorMessages = Object.values(errors).map(e => e.message).join(', ')
        toast.error(errorMessages)
      } else {
        toast.error(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/books')
  }

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditing ? 'Edit Book' : 'Add New Book'}
          </h1>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="bookId" className="block text-sm font-medium text-gray-700">
                  Book ID
                </label>
                <input
                  type="text"
                  id="bookId"
                  name="bookId"
                  value={formData.bookId}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., 00018"
                />
              </div>
              <div>
                <label htmlFor="accNo" className="block text-sm font-medium text-gray-700">
                  Accession Number *
                </label>
                <input
                  type="text"
                  id="accNo"
                  name="accNo"
                  required
                  value={formData.accNo}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., CS-001"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Book Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter book title"
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                  Author *
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  required
                  value={formData.author}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter author name"
                />
              </div>

              <div>
                <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
                  Publisher
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter publisher name"
                />
              </div>

              <div>
                <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700">
                  Published Year
                </label>
                <input
                  type="number"
                  id="publishedYear"
                  name="publishedYear"
                  value={formData.publishedYear}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., 2023"
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department *
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="Enter department name"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field mt-1"
                >
                  <option value="Available">Available</option>
                  <option value="Issued">Issued</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label htmlFor="locationRack" className="block text-sm font-medium text-gray-700">
                  Location Rack *
                </label>
                <input
                  type="text"
                  id="locationRack"
                  name="locationRack"
                  required
                  value={formData.locationRack}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., A1"
                />
              </div>

              <div>
                <label htmlFor="shelf" className="block text-sm font-medium text-gray-700">
                  Shelf *
                </label>
                <input
                  type="text"
                  id="shelf"
                  name="shelf"
                  required
                  value={formData.shelf}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., 1"
                />
              </div>

              <div>
                <label htmlFor="callNumber" className="block text-sm font-medium text-gray-700">
                  Call Number *
                </label>
                <input
                  type="text"
                  id="callNumber"
                  name="callNumber"
                  required
                  value={formData.callNumber}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., 005.1/ABC"
                />
              </div>

              <div>
                <label htmlFor="edition" className="block text-sm font-medium text-gray-700">
                  Edition
                </label>
                <input
                  type="text"
                  id="edition"
                  name="edition"
                  value={formData.edition}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="e.g., 3rd Edition"
                />
              </div>

              <div>
                <label htmlFor="numberOfCopies" className="block text-sm font-medium text-gray-700">
                  Number of Copies *
                </label>
                <input
                  type="number"
                  id="numberOfCopies"
                  name="numberOfCopies"
                  required
                  value={formData.numberOfCopies}
                  onChange={handleChange}
                  className="input-field mt-1"
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                ISBN
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="input-field mt-1"
                placeholder="e.g., 978-3-16-148410-0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="input-field mt-1"
              placeholder="Enter book description (optional)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary inline-flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Book' : 'Add Book'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminPanel
