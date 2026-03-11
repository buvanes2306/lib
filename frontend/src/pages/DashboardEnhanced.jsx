import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Library,
  Plus,
  Eye
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import axios from 'axios'

const DashboardEnhanced = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    totalUsers: 0
  })
  const [recentBooks, setRecentBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        setDebugInfo(null)
        
        console.log('🚀 Starting dashboard data fetch...')
        console.log('👤 User:', user)
        
        // Test 1: Direct API call
        console.log('📡 Testing direct API call...')
        const booksResponse = await axios.get('/api/books', {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        })
        
        console.log('✅ Books API Response:', booksResponse.data)
        
        // Test 2: Users stats (admin only)
        let usersResponse = { data: { data: { totalUsers: 0 } } }
        if (user?.role === 'admin') {
          console.log('👥 Fetching users stats...')
          try {
            usersResponse = await axios.get('/api/users/stats', {
              withCredentials: true
            })
            console.log('✅ Users API Response:', usersResponse.data)
          } catch (userError) {
            console.warn('⚠️ Users API failed:', userError.response?.data || userError.message)
          }
        }

        // Process data
        const booksData = booksResponse.data.data
        const usersData = usersResponse.data.data

        console.log('📊 Processing data...')
        console.log('Books data:', booksData)
        console.log('Users data:', usersData)

        // Validate data structure
        if (!booksData || !booksData.books) {
          throw new Error('Invalid books data structure')
        }

        const totalBooks = booksData.pagination?.total || booksData.books.length
        const availableBooks = booksData.books.filter(book => book.status === 'Available').length
        const issuedBooks = booksData.books.filter(book => book.status === 'Issued').length

        console.log('📈 Calculated stats:', {
          totalBooks,
          availableBooks,
          issuedBooks,
          totalUsers: usersData.totalUsers || 0
        })

        setStats({
          totalBooks,
          availableBooks,
          issuedBooks,
          totalUsers: usersData.totalUsers || 0
        })

        // Take first 5 books for recent books
        const recentBooksData = booksData.books.slice(0, 5)
        console.log('📚 Recent books:', recentBooksData)
        setRecentBooks(recentBooksData)
        
        // Set debug info
        setDebugInfo({
          apiResponse: booksResponse.data,
          dataStructure: {
            hasBooks: !!booksData.books,
            booksCount: booksData.books.length,
            hasPagination: !!booksData.pagination,
            pagination: booksData.pagination
          }
        })

      } catch (error) {
        console.error('❌ Dashboard fetch error:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        
        setError({
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-4">Dashboard Error</h2>
          <div className="text-red-700">
            <p><strong>Error:</strong> {error.message}</p>
            <p><strong>Status:</strong> {error.status || 'Unknown'}</p>
            {error.data && <pre className="mt-2 text-xs bg-red-100 p-2 rounded">{JSON.stringify(error.data, null, 2)}</pre>}
          </div>
        </div>
        
        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Debug Information</h3>
            <pre className="text-xs bg-blue-100 p-2 rounded overflow-auto max-h-96">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        {user?.role === 'admin' && (
          <Link
            to="/admin-panel"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
            </div>
            <Library className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.availableBooks}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issued</p>
              <p className="text-2xl font-bold text-orange-600">{stats.issuedBooks}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        )}
      </div>

      {/* Recent Books */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Books</h2>
          <Link to="/books" className="text-blue-600 hover:text-blue-800 text-sm">
            View All
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'admin' 
                ? 'Start by adding your first book to the library.'
                : 'No books have been added to the library yet.'
              }
            </p>
            {user?.role === 'admin' && (
              <Link
                to="/admin-panel"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Book
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accession No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {book.accNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{book.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">{book.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.status === 'Available' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/books/${book._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DashboardEnhanced
