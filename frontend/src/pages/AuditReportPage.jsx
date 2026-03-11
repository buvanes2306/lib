import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Home,
  Filter,
  Calendar
} from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuditReportPage = () => {
  const { auditSessionId } = useParams()
  const navigate = useNavigate()
  
  const [auditSession, setAuditSession] = useState(null)
  const [reports, setReports] = useState([])
  const [librarySummary, setLibrarySummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  
  // Load audit report
  useEffect(() => {
    loadAuditReport()
  }, [auditSessionId])

  const loadAuditReport = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/audit/report/${auditSessionId}`)
      
      setAuditSession(response.data.auditSession)
      setReports(response.data.reports)
      setLibrarySummary(response.data.librarySummary || null)
    } catch (error) {
      console.error('Load audit report error:', error)
      toast.error('Failed to load audit report')
    } finally {
      setLoading(false)
    }
  }

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true
    if (filter === 'found') return report.status === 'found'
    if (filter === 'missing') return report.status === 'missing'
    if (filter === 'misplaced') return report.status === 'misplaced'
    return true
  })

  // Get status counts
  const statusCounts = {
    total: reports.length,
    found: reports.filter(r => r.status === 'found').length,
    missing: reports.filter(r => r.status === 'missing').length,
    misplaced: reports.filter(r => r.status === 'misplaced').length
  }

  // Format duration
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A'
    const duration = Math.floor((endTime - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Book ID', 'Accession No', 'Title', 'Author', 'Expected Rack', 'Expected Shelf', 'Actual Rack', 'Actual Shelf', 'Status', 'Notes', 'Scanned At']
    const csvContent = [
      headers.join(','),
      ...filteredReports.map(report => [
        report.bookId,
        report.accNo,
        `"${report.title.replace(/"/g, '""')}"`,
        `"${report.author.replace(/"/g, '""')}"`,
        report.expectedRack,
        report.expectedShelf,
        report.actualRack || 'N/A',
        report.actualShelf || 'N/A',
        report.status,
        `"${report.notes.replace(/"/g, '""')}"`,
        new Date(report.scannedAt).toLocaleString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-report-${auditSessionId}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Audit report exported to CSV')
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'found': return 'text-green-600 bg-green-100'
      case 'missing': return 'text-red-600 bg-red-100'
      case 'misplaced': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'found': return <CheckCircle className="h-4 w-4" />
      case 'missing': return <AlertCircle className="h-4 w-4" />
      case 'misplaced': return <AlertCircle className="h-4 w-4" />
      default: return null
    }
  }

  const getRowHighlightClass = (status) => {
    if (status === 'missing') return 'bg-red-50 hover:bg-red-100'
    if (status === 'misplaced') return 'bg-yellow-50 hover:bg-yellow-100'
    return 'hover:bg-gray-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading audit report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">📊 Audit Report</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/audit')}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Audit
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
          
          {/* Audit Session Info */}
          {auditSession && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Session ID:</span>
                  <p className="font-mono text-sm font-semibold">{auditSession.sessionId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Auditor:</span>
                  <p className="font-semibold">{auditSession.auditor}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Duration:</span>
                  <p className="font-semibold">
                    {formatDuration(auditSession.startTime, auditSession.endTime)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <p className="font-semibold text-gray-600">
                    {auditSession.status === 'completed' ? '✅ Completed' : '🟢 Active'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{statusCounts.total}</div>
                <div className="text-sm text-gray-600">Total Books</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{statusCounts.found}</div>
                <div className="text-sm text-gray-600">Found</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.misplaced}</div>
                <div className="text-sm text-gray-600">Mismatched</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full mr-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{statusCounts.missing}</div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{librarySummary?.onCirculateBooks ?? 0}</div>
                <div className="text-sm text-gray-600">On Circulation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-semibold">Filter Results</h2>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'found', 'missing', 'misplaced'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' && 'All Books'}
                {status === 'found' && '✅ Found'}
                {status === 'missing' && '❌ Missing'}
                {status === 'misplaced' && '⚠️ Misplaced'}
              </button>
            ))}
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">📋 Audit Results ({filteredReports.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actual Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scanned At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report, index) => (
                  <tr key={index} className={getRowHighlightClass(report.status)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {report.bookId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{report.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate">{report.author}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Rack {report.expectedRack}, Shelf {report.expectedShelf}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {report.actualRack && report.actualShelf ? (
                        `Rack ${report.actualRack}, Shelf ${report.actualShelf}`
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          <span className="ml-2">{report.status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className={`max-w-xs truncate ${
                        report.status === 'missing'
                          ? 'text-red-700 font-semibold'
                          : report.status === 'misplaced'
                          ? 'text-yellow-700 font-semibold'
                          : ''
                      }`}>
                        {report.notes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.scannedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditReportPage
