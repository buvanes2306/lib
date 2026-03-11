import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Scan, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Home,
  FileText
} from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import ShelfScanner from '../components/ShelfScanner'

const AuditPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Audit session state
  const [auditSession, setAuditSession] = useState(null)
  const [currentRack, setCurrentRack] = useState('')
  const [currentShelf, setCurrentShelf] = useState('')
  const [scannedCodes, setScannedCodes] = useState([])
  const [isScanning, setIsScanning] = useState(false)
  const [sessionSummary, setSessionSummary] = useState(null)
  
  // Dynamic locations state
  const [locations, setLocations] = useState([])
  const [locationsWithCounts, setLocationsWithCounts] = useState([])
  
  // Precomputed selected rack object for better performance
  const selectedRack = locations.find(
    loc => String(loc.rack) === String(currentRack)
  )
  
  const selectedRackWithCounts = locationsWithCounts.find(
    loc => String(loc.rack) === String(currentRack)
  )
  
  // Get available locations from database
  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const [locationsResponse, countsResponse] = await Promise.all([
        api.get('/locations'),
        api.get('/locations-with-counts')
      ])
      setLocations(locationsResponse.data)
      setLocationsWithCounts(countsResponse.data)
    } catch (error) {
      console.error('Fetch locations error:', error)
      toast.error('Failed to load locations')
    }
  }

  // Start new audit session
  const startAuditSession = async () => {
    try {
      const auditor = user?.name || 'Unknown Auditor'
      
      const response = await api.post('/audit/start', { auditor })
      
      setAuditSession({
        sessionId: response.data.sessionId,
        auditor: response.data.auditor,
        startTime: new Date(),
        status: 'active'
      })
      
      toast.success(`Audit session started: ${response.data.sessionId}`)
    } catch (error) {
      console.error('Start audit session error:', error)
      toast.error('Failed to start audit session')
    }
  }

  // Scan current shelf
  const scanShelf = async () => {
    if (!currentRack || !currentShelf || scannedCodes.length === 0) {
      toast.error('Please select rack/shelf and scan at least one book')
      return
    }

    try {
      setIsScanning(true)
      
      const response = await api.post('/audit/scan-shelf', {
        sessionId: auditSession.sessionId,
        rack: currentRack,
        shelf: currentShelf,
        scannedCodes
      })

      setSessionSummary(response.data.summary)
      
      toast.success(`Shelf ${currentRack}-${currentShelf} scanned: ${response.data.booksFound} found, ${response.data.booksMissing} missing, ${response.data.booksMisplaced} misplaced`)
      
      // Clear scanned codes for next shelf
      setScannedCodes([])
      
    } catch (error) {
      console.error('Scan shelf error:', error)
      toast.error('Failed to scan shelf')
    } finally {
      setIsScanning(false)
    }
  }

  // Finalize audit session
  const finalizeAudit = async () => {
    if (!auditSession) {
      toast.error('No active audit session')
      return
    }

    try {
      const notes = prompt('Enter audit notes (optional):') || ''
      
      const response = await api.post('/audit/finalize', {
        sessionId: auditSession.sessionId,
        notes
      })

      setAuditSession(prev => ({ ...prev, status: 'completed', endTime: new Date() }))
      
      toast.success(`Audit finalized: ${response.data.summary.totalScanned} books scanned`)
      
      // Redirect to report page
      setTimeout(() => {
        navigate(`/audit-report/${auditSession.sessionId}`)
      }, 2000)
      
    } catch (error) {
      console.error('Finalize audit error:', error)
      toast.error(error.response?.data?.message || 'Failed to finalize audit')
    }
  }

  // Add scanned code
  const addScannedCode = (code) => {
    if (!scannedCodes.includes(code)) {
      setScannedCodes(prev => [...prev, code])
    }
  }

  // Remove scanned code
  const removeScannedCode = (code) => {
    setScannedCodes(prev => prev.filter(c => c !== code))
  }

  // Format duration
  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A'
    const duration = Math.floor((endTime - startTime) / 1000)
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">📋 Shelf Audit System</h1>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
          
          {/* Audit Session Info */}
          {auditSession ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Session ID:</span>
                  <p className="font-mono text-sm font-semibold">{auditSession.sessionId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Auditor:</span>
                  <p className="font-semibold">{auditSession.auditor}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <p className={`font-semibold ${
                    auditSession.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {auditSession.status === 'active' ? '🟢 Active' : '✅ Completed'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Duration:</span>
                  <p className="font-semibold">
                    {formatDuration(auditSession.startTime, auditSession.endTime)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <button
                onClick={startAuditSession}
                className="w-full btn btn-primary"
              >
                <Play className="h-4 w-4 mr-2" />
                Start New Audit Session
              </button>
            </div>
          )}
        </div>

        {auditSession && (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">🎛️ Audit Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Rack Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rack
                  </label>
                  <select
                    value={currentRack}
                    onChange={(e) => {
                      setCurrentRack(e.target.value)
                      setCurrentShelf('') // reset shelf when rack changes
                    }}
                    className="input-field"
                  >
                    <option value="">Select Rack</option>
                    {locationsWithCounts.map(loc => (
                      <option key={loc.rack} value={loc.rack}>
                        Rack {loc.rack} ({loc.totalBooks} books, {loc.shelves.length} shelves)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shelf Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shelf
                  </label>
                  <select
                    value={currentShelf}
                    onChange={(e) => setCurrentShelf(e.target.value)}
                    disabled={!currentRack}
                    className="input-field"
                  >
                    <option value="">Select Shelf</option>
                    {selectedRackWithCounts?.shelves.map(shelf => (
                      <option key={shelf.shelf} value={shelf.shelf}>
                        Shelf {shelf.shelf} ({shelf.bookCount} books)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scan Button */}
                <div className="flex items-end">
                  <button
                    onClick={scanShelf}
                    disabled={isScanning || !currentRack || !currentShelf}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                    {isScanning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2 animate-pulse" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Scan Shelf {currentRack}-{currentShelf}
                      </>
                    )}
                  </button>
                </div>

                {/* Finalize Button */}
                <div className="flex items-end">
                  <button
                    onClick={finalizeAudit}
                    className="btn btn-secondary w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalize Audit
                  </button>
                </div>
              </div>
            </div>

            {/* Session Summary */}
            {sessionSummary && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">📊 Session Summary</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{sessionSummary.totalScanned}</div>
                    <div className="text-sm text-gray-600">Total Scanned</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{sessionSummary.totalFound}</div>
                    <div className="text-sm text-gray-600">Found</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{sessionSummary.totalMisplaced}</div>
                    <div className="text-sm text-gray-600">Misplaced</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{sessionSummary.totalMissing}</div>
                    <div className="text-sm text-gray-600">Missing</div>
                  </div>
                </div>
              </div>
            )}

            {/* Scanner + Scanned Codes */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">📱 Scanned Codes ({scannedCodes.length})</h2>
              
              <div className="mb-6">
                <ShelfScanner onCodesChange={setScannedCodes} />
              </div>

              {scannedCodes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Scan className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>Scan barcodes or enter codes manually</p>
                  <p className="text-sm">Select rack and shelf above, then scan books in that location</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {scannedCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="font-mono font-semibold">{code}</span>
                      </div>
                      <button
                        onClick={() => removeScannedCode(code)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Code Entry */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">⌨️ Manual Code Entry</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter barcode manually"
                  className="input-field flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addScannedCode(e.target.value.trim())
                      e.target.value = ''
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter barcode manually"]')
                    if (input && input.value.trim()) {
                      addScannedCode(input.value.trim())
                      input.value = ''
                    }
                  }}
                  className="btn btn-primary"
                >
                  Add Code
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AuditPage
