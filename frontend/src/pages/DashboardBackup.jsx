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

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    issuedBooks: 0,
    totalUsers: 0
  })
  const [recentBooks, setRecentBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🚀 Dashboard: Fetching data...')
        const [booksResponse, usersResponse] = await Promise.all([
          axios.get('/api/books'),
          user?.role === 'admin' ? axios.get('/api/users/stats') : Promise.resolve({ data: { data: { totalUsers: 0 } } })
        ])

        console.log('📚 Dashboard: Books response:', booksResponse.data)
        const booksData = booksResponse.data.data
        
        // Normalize IDs - convert _id to id
        const processedBooks = booksData.books.map(book => ({
          ...book,
          id: book._id // Add id field for frontend compatibility
        }))
        
        const usersData = usersResponse.data.data

        console.log('📊 Dashboard: Processed books data:', processedBooks)

        const totalBooks = booksData.pagination.total
        const availableBooks = processedBooks.filter(book => book.status === 'Available').length
        const issuedBooks = processedBooks.filter(book => book.status === 'Issued').length

        console.log('📈 Dashboard: Stats calculated:', { totalBooks, availableBooks, issuedBooks })

        setStats({
          totalBooks,
          availableBooks,
          issuedBooks,
          totalUsers: usersData.totalUsers || 0
        })

        const recentBooksData = processedBooks.slice(0, 5)
        console.log('📖 Dashboard: Recent books:', recentBooksData)
        setRecentBooks(recentBooksData)
      } catch (error) {
        console.error('❌ Dashboard: Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

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
      icon: Library,
      color: 'bg-green-500',
      link: '/books?status=Available'
    },
    {
      title: 'Issued Books',
      value: stats.issuedBooks,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      link: '/books?status=Issued'
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
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user?.name}! Here's what's happening in your library today.
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={stat.link}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  View all <span className="sr-only">{stat.title}</span>
                </Link>
              </div>
            </div>
          )
        })}
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
            {/* Debug Info */}
            <div className="mt-4 p-4 bg-gray-100 rounded text-left">
              <h4 className="font-semibold">Debug Info:</h4>
              <p>Recent books length: {recentBooks.length}</p>
              <p>User: {user?.email} ({user?.role})</p>
              <p>Total books: {stats.totalBooks}</p>
              <p>Available books: {stats.availableBooks}</p>
            </div>
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
