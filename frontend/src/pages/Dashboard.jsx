import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Library,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../api/axios'

const departments = [
  'All',
  'SECE : COMPUTER & COMMUNICATION ENGG',
  'SECE : COMPUTER SCIENCE & ENGG',
  'SECE : INFORMATION TECHNOLOGY',
  'SCIENCE AND HUMANITIES'
]

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    totalUsers: 0
  })
  const [recentBooks, setRecentBooks] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefreshing, setAutoRefreshing] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)
  const REFRESH_INTERVAL = 60000 // 60 seconds (increased from 30)

  const fetchDashboardData = useCallback(async (isManualRefresh = false, isAutoRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true)
      } else if (isAutoRefresh) {
        setAutoRefreshing(true)
      }
      
      const [booksResponse, usersResponse, allBooksResponse] = await Promise.all([
        api.get('/books?limit=5'),
        user?.role === 'admin'
          ? api.get('/users/public-stats')
          : Promise.resolve({ data: { data: { totalUsers: 0 } } }),
        api.get('/books?limit=1000')
      ])
      
      const booksData = booksResponse.data.data
      const allBooksData = allBooksResponse.data.data
      
      const processedBooks = booksData.books.map(book => ({
        ...book,
        id: book._id
      }))
      
      const usersData = usersResponse.data.data.totalUsers
      const totalBooks = allBooksData.pagination.total
      const issuedBooks = allBooksData.books.filter(book => book.status === 'Issued').length
      const availableBooks = totalBooks - issuedBooks

      setStats({
        totalBooks,
        availableBooks,
        issuedBooks,
        totalUsers: usersData
      })

      setRecentBooks(processedBooks)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('❌ Dashboard: Error fetching data:', error)
      // If rate limited, disable auto-refresh temporarily
      if (error.response?.status === 429) {
        setAutoRefreshEnabled(false)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      setAutoRefreshing(false)
    }
  }, [])

  const handleManualRefresh = () => {
    fetchDashboardData(true)
  }

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled)
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Set up auto-refresh only if enabled
    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(() => {
        fetchDashboardData(false, true)
      }, REFRESH_INTERVAL)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefreshEnabled])

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'bg-blue-500',
      link: '/books'
    },
    {
      title: 'Available Books',
      value: stats.availableBooks,
      icon: BookOpen,
      color: 'bg-green-500',
      link: '/books'
    },
    {
      title: 'Issued Books',
      value: stats.issuedBooks,
      icon: BookOpen,
      color: 'bg-orange-500',
      link: '/books'
    }
  ]

  if (user?.role === 'admin') {
    statCards.push({
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      link: '/users'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              {autoRefreshing && autoRefreshEnabled && (
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span className="text-xs">Auto-updating...</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoRefresh}
            className={`btn ${autoRefreshEnabled ? 'btn-secondary' : 'btn-outline'} flex items-center gap-2`}
            title={autoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
          >
            <TrendingUp className="w-4 h-4" />
            Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Book
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <card.icon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Books */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Books</h2>
          <Link
            to="/books"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium inline-flex items-center"
          >
            View all
            <Eye className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <div className="text-center py-8">
            <Library className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new book to library.
            </p>
            {user?.role === 'admin' && (
              <div className="mt-6">
                <Link
                  to="/admin"
                  className="btn btn-primary inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBooks.map((book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/books/${book.id}`}
                        className="text-primary-600 hover:text-primary-500 font-medium"
                      >
                        {book.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {book.author || (Array.isArray(book.authors) ? book.authors.join(', ') : 'N/A')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{book.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        book.status === 'Available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {book.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
