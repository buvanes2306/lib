import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import api from '../api/axios'
import LoadingSpinner from '../components/LoadingSpinner'



const Books = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ department: '', status: '', publishedYear: '' })
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [sortConfig, setSortConfig] = useState({ key: 'bookId', direction: 'asc' })
  const [yearInputValue, setYearInputValue] = useState('')

  const fetchBooks = async () => {
    try {
      setLoading(true)
      console.log('🚀 Books: Fetching books...')
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.department && { department: filters.department }),
        ...(filters.status && { status: filters.status }),
        ...(filters.publishedYear && { publishedYear: filters.publishedYear }),
        ...(sortConfig.key && { sortBy: sortConfig.key, sortOrder: sortConfig.direction })
      })

      console.log('📡 Books: API call to:', `http://localhost:5002/api/books?${params}`)
      const response = await api.get(`/books?${params}`)
      console.log('📚 Books: API response:', response.data)
      
      // Normalize IDs - convert _id to id
      const processedBooks = response.data.data.books.map(book => ({
        ...book,
        id: book._id // Add id field for frontend compatibility
      }))
      
      setBooks(processedBooks)
      setPagination(response.data.data.pagination)
      console.log('✅ Books: State updated with normalized IDs')
    } catch (error) {
      console.error('❌ Books: Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  useEffect(() => {
    fetchBooks()
  }, [pagination.page, searchTerm, sortConfig.key, sortConfig.direction, filters.department, filters.status, filters.publishedYear])

  
  


  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleYearChange = (e) => {
    const raw = e.target.value
    // Allow only digits, max 4 characters (no 'e', '+', '-', or decimals)
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 4)
    setYearInputValue(digitsOnly)

    if (digitsOnly.length === 4 || digitsOnly === '') {
      setFilters(prev => ({ ...prev, publishedYear: digitsOnly }))
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }

  const handleYearKeyPress = (e) => {
    if (e.key === 'Enter') {
      const value = yearInputValue.replace(/\D/g, '').slice(0, 4)
      setFilters(prev => ({ ...prev, publishedYear: value }))
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchBooks()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'search') {
      setSearchTerm(value)
    }
  }

  const handleEdit = (book) => {
    console.log('🖊 Edit clicked for book:', book)
    // Use normalized id for consistency
    navigate(`/admin/${book.id}`)
  }

  const deleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      await api.delete(`/books/${bookId}`)
      fetchBooks()
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }

  const handleDelete = async (book) => {
    if (!confirm('Are you sure you want to delete this book?')) return

    try {
      await deleteBook(book.id)
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }

  if (loading && books.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Books</h1>
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="btn btn-primary inline-flex items-center"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Add New Book
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar - Bigger */}
          <div className="md:col-span-2 lg:col-span-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Books
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Search by title, author, publisher, accession number..."
                value={searchTerm}
                onChange={handleChange}
                className="input-field pl-10 pr-4 h-12 w-full"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Departments</option>
              <option value="INFORMATION TECHNOLOGY">Information Technology</option>
              <option value="COMPUTER SCIENCE">Computer Science</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="GENERAL">General</option>
              <option value="MATHS">Maths</option>
            </select>
          </div>

          {/* Published Year Filter */}
          <div>
            <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700 mb-1">
              Published Year
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="publishedYear"
              name="publishedYear"
              placeholder="e.g., 2023"
              value={yearInputValue}
              onChange={handleYearChange}
              onKeyDown={handleYearKeyPress}
              className="input-field"
              maxLength={4}
              aria-label="Published year (4 digits)"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFilters({ department: '', status: '', publishedYear: '' })
              setYearInputValue('')
              setSearchTerm('')
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="btn btn-secondary"
          >
            Clear All Filters
          </button>
        </div>
      </div>
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('bookId')}>
                  Book ID {sortConfig.key === 'bookId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('accNo')}>
                  Accession No {sortConfig.key === 'accNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('title')}>
                  Title {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('author')}>
                  Author {sortConfig.key === 'author' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('publisher')}>
                  Publisher {sortConfig.key === 'publisher' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('publishedYear')}>
                  Published Year {sortConfig.key === 'publishedYear' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('department')}>
                  Department {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell cursor-pointer hover:bg-gray-50" onClick={() => handleSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell">Location</th>
                {user?.role === 'admin' && (
                  <th className="table-header-cell">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="table-body">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 10 : 9} className="px-6 py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? 'Try adjusting your search'
                        : 'Get started by adding a new book to the library.'}
                    </p>
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="table-row">
                    <td className="table-cell font-medium">{book.bookId || 'N/A'}</td>
                    <td className="table-cell font-medium">{book.accNo}</td>
                    <td className="table-cell">
                      <Link
                        to={`/books/${book.id}`}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                      >
                        {book.title}
                      </Link>
                    </td>
                    <td className="table-cell">{book.author || (book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'N/A')}</td>
                    <td className="table-cell">{book.publisher}</td>
                    <td className="table-cell">{book.publishedYear}</td>
                    <td className="table-cell">{book.department}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.status === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">
                        <div>Rack: {book.location?.rack || 'N/A'}</div>
                        <div>Shelf: {book.location?.shelf || 'N/A'}</div>
                      </div>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <Link
                            to={`/books/${book.id}`}
                            className="text-primary-600 hover:text-primary-500"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(book)}
                            className="text-blue-600 hover:text-blue-500"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            className="text-red-600 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Books
