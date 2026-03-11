import React, { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { preprocessBarcodeImage } from '../utils/deepBarcodePreprocess'

const ShelfScanner = ({ onCodesChange }) => {
  const [codes, setCodes] = useState(new Set())
  const [scanning, setScanning] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [detectedBooks, setDetectedBooks] = useState([])
  const [availableCameras, setAvailableCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [loadError, setLoadError] = useState(null)
  const [dlPreprocessingEnabled, setDlPreprocessingEnabled] = useState(true)
  const [dlCameraPreprocessingEnabled, setDlCameraPreprocessingEnabled] = useState(true)

  const videoRef = useRef(null)
  const fileInputRef = useRef(null)
  const codeReaderRef = useRef(null)
  const cancelScanRef = useRef(null)
  const scannedRef = useRef(new Map())
  const cameraFrameCanvasRef = useRef(null)
  const cameraFrameIntervalRef = useRef(null)
  const cameraFrameBusyRef = useRef(false)

  // Notify parent when codes change (for audit integration)
  useEffect(() => {
    if (onCodesChange) {
      onCodesChange([...codes])
    }
  }, [codes, onCodesChange])

  // Initialize ZXing reader
  useEffect(() => {
    try {
      const hints = new Map()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.ITF,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
      ])

      codeReaderRef.current = new BrowserMultiFormatReader(hints)

      // Get available cameras
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput')
          setAvailableCameras(videoDevices)
          
          // Auto-select first camera if none selected
          if (videoDevices.length > 0 && !selectedCamera) {
            setSelectedCamera(videoDevices[0].deviceId)
          }
        })
        .catch(err => {
          console.error('Camera enumeration error:', err)
          setLoadError('Failed to detect cameras. Please check camera permissions.')
        })
    } catch (err) {
      console.error('ZXing init error:', err)
      setLoadError('Failed to load scanner library. Please refresh page.')
    }

    return () => {
      stopCameraStream()
    }
  }, [])

  // Stop camera and scanning
  const stopCameraStream = () => {
    // Stop ZXing decoding by resetting the reader
    try {
      if (codeReaderRef.current && typeof codeReaderRef.current.reset === 'function') {
        codeReaderRef.current.reset()
      }
    } catch (_) {}

    // Clear the scan control reference
    cancelScanRef.current = null
    cameraFrameBusyRef.current = false

    if (cameraFrameIntervalRef.current) {
      clearInterval(cameraFrameIntervalRef.current)
      cameraFrameIntervalRef.current = null
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    setScanning(false)
  }

  // Handle image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !codeReaderRef.current) return

    setProcessing(true)
    setCodes(new Set())
    setDetectedBooks([])

    const objectUrl = URL.createObjectURL(file)
    setUploadedImage(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return objectUrl
    })

    const img = new Image()
    img.onload = async () => {
      try {
        const decodeSources = new Set()
        const allDecodedCodes = new Set()

        const pythonCodes = await requestPythonDlDecode(img)
        for (const code of pythonCodes) {
          allDecodedCodes.add(code)
        }
        if (pythonCodes.length > 0) decodeSources.add('python-dl')

        if (dlPreprocessingEnabled) {
          try {
            const preprocessedCanvas = await preprocessBarcodeImage(img)
            const preprocessedCandidates = await generateImageCandidates(preprocessedCanvas, true)
            const candidateResults = await decodeFromCandidates(preprocessedCandidates)
            candidateResults.forEach(r => {
              const text = r?.getText?.()
              if (text) allDecodedCodes.add(text)
            })
            if (candidateResults.length > 0) decodeSources.add('dl-preprocessed')
          } catch (preprocessError) {
            console.warn('DL preprocessing failed. Falling back to original image.', preprocessError)
          }
        }

        const originalCandidates = await generateImageCandidates(img, false)
        const fallbackResults = await decodeFromCandidates(originalCandidates)
        fallbackResults.forEach(r => {
          const text = r?.getText?.()
          if (text) allDecodedCodes.add(text)
        })
        if (fallbackResults.length > 0) decodeSources.add('enhanced-original')

        if (allDecodedCodes.size === 0) {
          toast.error('No barcode detected in image')
          return
        }

        // Collect unique, non-empty codes
        const detectedSet = new Set(
          [...allDecodedCodes]
            .map(code => normalizeCode(code))
            .filter(code => code && code.trim() !== '')
        )

        if (detectedSet.size === 0) {
          toast.error('No valid barcodes found')
          return
        }

        // Update UI with all detected codes
        setCodes(detectedSet)

        // Use batch lookup instead of per-code lookup for shelf mode
        await processBatchCodes([...detectedSet])

        const decodeSourceLabel = decodeSources.size > 0
          ? [...decodeSources].join(' + ')
          : 'fallback'

        toast.success(
          `${detectedSet.size} barcodes detected from ${decodeSourceLabel} image`
        )
      } catch (error) {
        console.error('Multi-barcode detection error:', error)
        toast.error('Failed to detect barcodes from image')
      } finally {
        setProcessing(false)
      }
    }
    img.onerror = () => {
      toast.error('Failed to load image')
      setProcessing(false)
    }
    img.src = objectUrl
  }

  const canvasToImage = (canvas) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = canvas.toDataURL('image/png')
    })

  const requestPythonDlDecode = async (imageElementOrCanvas) => {
    try {
      const tempCanvas =
        imageElementOrCanvas instanceof HTMLCanvasElement
          ? imageElementOrCanvas
          : await toCanvas(imageElementOrCanvas)
      const imageBase64 = tempCanvas.toDataURL('image/jpeg', 0.92)
      const response = await api.post('/dl/scan-frame', { imageBase64 })
      if (!response?.data?.success || !Array.isArray(response.data.codes)) {
        return []
      }
      return response.data.codes
        .map(code => normalizeCode(code))
        .filter(Boolean)
    } catch (_) {
      return []
    }
  }

  const createBarcodeLikeResult = (text) => ({
    getText: () => text
  })

  const detectWithNativeBarcodeDetector = async (imageOrCanvas) => {
    try {
      if (typeof window === 'undefined' || typeof window.BarcodeDetector !== 'function') {
        return []
      }

      const detector = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e', 'qr_code']
      })

      const detections = await detector.detect(imageOrCanvas)
      return detections
        .map(d => normalizeCode(d?.rawValue))
        .filter(Boolean)
    } catch (_) {
      return []
    }
  }

  const rotateCanvas = (sourceCanvas, angleDeg) => {
    const angle = (angleDeg * Math.PI) / 180
    const sin = Math.abs(Math.sin(angle))
    const cos = Math.abs(Math.cos(angle))
    const newWidth = Math.ceil(sourceCanvas.width * cos + sourceCanvas.height * sin)
    const newHeight = Math.ceil(sourceCanvas.width * sin + sourceCanvas.height * cos)

    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, newWidth, newHeight)
    ctx.translate(newWidth / 2, newHeight / 2)
    ctx.rotate(angle)
    ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2)
    return canvas
  }

  const enhanceCanvasForLowLight = (sourceCanvas) => {
    const canvas = document.createElement('canvas')
    canvas.width = sourceCanvas.width
    canvas.height = sourceCanvas.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(sourceCanvas, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const gray = 0.299 * r + 0.587 * g + 0.114 * b

      // Gamma + contrast stretch for dark camera captures
      const gammaCorrected = Math.pow(gray / 255, 0.7) * 255
      const contrasted = Math.max(0, Math.min(255, (gammaCorrected - 128) * 1.45 + 128))

      data[i] = contrasted
      data[i + 1] = contrasted
      data[i + 2] = contrasted
    }

    ctx.putImageData(imageData, 0, 0)

    // 2x upscale to make narrow barcode lines easier to decode
    const upscaled = document.createElement('canvas')
    upscaled.width = canvas.width * 2
    upscaled.height = canvas.height * 2
    const upscaledCtx = upscaled.getContext('2d')
    upscaledCtx.imageSmoothingEnabled = false
    upscaledCtx.drawImage(canvas, 0, 0, upscaled.width, upscaled.height)

    return upscaled
  }

  const toCanvas = async (imageElement) => {
    const width = imageElement.naturalWidth || imageElement.width
    const height = imageElement.naturalHeight || imageElement.height
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imageElement, 0, 0, width, height)
    return canvas
  }

  const generateImageCandidates = async (imageOrCanvas, alreadyEnhanced = false) => {
    const baseCanvas =
      imageOrCanvas instanceof HTMLCanvasElement ? imageOrCanvas : await toCanvas(imageOrCanvas)

    const workingCanvas = alreadyEnhanced ? baseCanvas : enhanceCanvasForLowLight(baseCanvas)
    const angles = [0, -15, -8, 8, 15, -90, 90]

    const candidates = []
    for (const angle of angles) {
      const rotated = angle === 0 ? workingCanvas : rotateCanvas(workingCanvas, angle)
      const img = await canvasToImage(rotated)
      candidates.push(img)
    }

    return candidates
  }

  const decodeFromCandidates = async (candidateImages) => {
    const decodedMap = new Map()
    for (const candidate of candidateImages) {
      const nativeCodes = await detectWithNativeBarcodeDetector(candidate)
      for (const code of nativeCodes) {
        decodedMap.set(code, createBarcodeLikeResult(code))
      }

      const currentResults = await decodeMultipleSafely(candidate)
      for (const result of currentResults) {
        const text = normalizeCode(result?.getText?.())
        if (text) {
          decodedMap.set(text, createBarcodeLikeResult(text))
        }
      }
      // short-circuit when enough labels are found
      if (decodedMap.size >= 50) break
    }
    return Array.from(decodedMap.values())
  }

  const decodeMultipleSafely = async (imageElement) => {
    const supportsNativeMulti =
      codeReaderRef.current &&
      typeof codeReaderRef.current.decodeMultipleFromImageElement === 'function'

    if (supportsNativeMulti) {
      try {
        return await codeReaderRef.current.decodeMultipleFromImageElement(imageElement)
      } catch (_) {
        // continue to compatibility fallback
      }
    }

    return await decodeWithTileFallback(imageElement)
  }

  const decodeWithTileFallback = async (imageElement) => {
    const decodedMap = new Map()

    const tryDecodeElement = async (element) => {
      const nativeCodes = await detectWithNativeBarcodeDetector(element)
      for (const code of nativeCodes) {
        decodedMap.set(code, createBarcodeLikeResult(code))
      }

      try {
        const single = await codeReaderRef.current.decodeFromImageElement(element)
        const text = single?.getText?.()
        if (text) decodedMap.set(text, single)
      } catch (_) {
        // no code in this region
      }
    }

    const width = imageElement.naturalWidth || imageElement.width
    const height = imageElement.naturalHeight || imageElement.height

    if (!(width > 0 && height > 0)) {
      return []
    }

    const baseCanvas = document.createElement('canvas')
    baseCanvas.width = width
    baseCanvas.height = height
    const baseCtx = baseCanvas.getContext('2d')
    baseCtx.drawImage(imageElement, 0, 0, width, height)

    const cropCanvas = (source, sx, sy, sw, sh) => {
      const canvas = document.createElement('canvas')
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh)
      return canvas
    }

    const binarizeCanvas = (source, threshold, invert = false) => {
      const canvas = document.createElement('canvas')
      canvas.width = source.width
      canvas.height = source.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(source, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        const v = gray > threshold ? 255 : 0
        const value = invert ? 255 - v : v
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
      }
      ctx.putImageData(imageData, 0, 0)
      return canvas
    }

    const decodeCanvasVariants = async (canvas) => {
      const rotatedPlus = rotateCanvas(canvas, 90)
      const rotatedMinus = rotateCanvas(canvas, -90)
      const variants = [
        canvas,
        rotatedPlus,
        rotatedMinus,
        binarizeCanvas(canvas, 90, false),
        binarizeCanvas(canvas, 120, false),
        binarizeCanvas(canvas, 150, false),
        binarizeCanvas(canvas, 120, true)
      ]

      for (const variant of variants) {
        const variantImg = await canvasToImage(variant)
        await tryDecodeElement(variantImg)
      }
    }

    // Full-image attempts first
    await tryDecodeElement(imageElement)
    await decodeCanvasVariants(baseCanvas)

    // Progressive grid sweep: large tiles + dense small windows
    const grids = [
      [2, 2],
      [3, 2],
      [4, 3],
      [6, 4]
    ]

    for (const [cols, rows] of grids) {
      const stepW = Math.floor(width / cols)
      const stepH = Math.floor(height / rows)

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const sx = x * stepW
          const sy = y * stepH
          const sw = x === cols - 1 ? width - sx : stepW
          const sh = y === rows - 1 ? height - sy : stepH

          if (sw < 80 || sh < 80) continue
          const tile = cropCanvas(baseCanvas, sx, sy, sw, sh)
          await decodeCanvasVariants(tile)

          // Stop early when enough barcodes are found
          if (decodedMap.size >= 30) {
            return Array.from(decodedMap.values())
          }
        }
      }
    }

    return Array.from(decodedMap.values())
  }

  const normalizeCode = (value) => String(value || '').trim().toUpperCase()

  const handleDetectedCode = (rawCode) => {
    const code = normalizeCode(rawCode)
    if (!code) return

    const now = Date.now()
    const lastScanTime = scannedRef.current.get(code) || 0
    if (now - lastScanTime < 1000) {
      return
    }

    scannedRef.current.set(code, now)

    setCodes(prev => {
      if (prev.has(code)) return prev
      const newSet = new Set(prev)
      newSet.add(code)
      return newSet
    })

    lookupBook(code)
    toast.success(`Scanned: ${code}`)
  }

  const decodeSingleSafely = async (imageElement) => {
    const single = await codeReaderRef.current.decodeFromImageElement(imageElement)
    return single?.getText ? single.getText() : null
  }

  const scanCameraFrameWithDL = async () => {
    if (!videoRef.current || !codeReaderRef.current || cameraFrameBusyRef.current) return
    if (videoRef.current.readyState < 2) return

    try {
      cameraFrameBusyRef.current = true

      const video = videoRef.current
      const canvas = cameraFrameCanvasRef.current || document.createElement('canvas')
      cameraFrameCanvasRef.current = canvas
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.85)
      let detectedCodes = []

      if (dlCameraPreprocessingEnabled) {
        try {
          const response = await api.post('/dl/scan-frame', { imageBase64: rawDataUrl })
          if (response?.data?.success && Array.isArray(response.data.codes)) {
            detectedCodes = response.data.codes
          }
        } catch (error) {
          console.warn('Python DL preprocessing unavailable, using browser fallback.', error)
        }
      }

      if (detectedCodes.length === 0) {
        const enhancedCanvas = await preprocessBarcodeImage(canvas)
        const enhancedImage = await canvasToImage(enhancedCanvas)
        const fallbackDetected = await decodeSingleSafely(enhancedImage)
        if (fallbackDetected) {
          detectedCodes = [fallbackDetected]
        }
      }

      if (detectedCodes.length === 0) {
        const rawImage = await canvasToImage(canvas)
        const rawDetected = await decodeSingleSafely(rawImage)
        if (rawDetected) {
          detectedCodes = [rawDetected]
        }
      }

      for (const code of detectedCodes) {
        handleDetectedCode(code)
      }
    } catch (_) {
      // Ignore frame-level decode misses and keep streaming
    } finally {
      cameraFrameBusyRef.current = false
    }
  }

  // Lookup book by barcode
  const lookupBook = async (barcode) => {
    try {
      const response = await api.get(`/books?accNo=${barcode}&limit=1`)
      const data = await response.data
      if (data.success && data.data.books.length > 0) {
        const book = data.data.books[0]
        setDetectedBooks(prev => {
          if (prev.some(b => b._id === book._id)) return prev
          return [...prev, book]
        })
        return book
      } else {
        const bookIdResponse = await api.get(`/books?bookId=${barcode}&limit=1`)
        const bookIdData = await bookIdResponse.data
        if (bookIdData.success && bookIdData.data.books.length > 0) {
          const book = bookIdData.data.books[0]
          setDetectedBooks(prev => {
            if (prev.some(b => b._id === book._id)) return prev
            return [...prev, book]
          })
          return book
        } else {
          toast(`Book not found for barcode: ${barcode}`, { icon: "⚠️" })
          return null
        }
      }
    } catch (error) {
      console.error('Book lookup error:', error)
      toast.error('Failed to lookup book')
      return null
    }
  }

  // Start live camera scan
  const startCameraScan = async () => {
    if (!codeReaderRef.current) return

    stopCameraStream() // stop previous scan

    try {
      setScanning(true)
      setCodes(new Set())
      setDetectedBooks([])
      setUploadedImage(null)

      // Use selected camera or find USB camera
      let targetDevice = null
      
      if (selectedCamera) {
        // Use previously selected camera
        targetDevice = availableCameras.find(d => d.deviceId === selectedCamera)
      }
      
      if (!targetDevice) {
        // Try to find USB camera (external cameras usually have "USB" in label or are not default)
        targetDevice = availableCameras.find(d => 
          d.label && (
            d.label.toLowerCase().includes('usb') ||
            d.label.toLowerCase().includes('external') ||
            d.label.toLowerCase().includes('hd') ||
            !d.label.toLowerCase().includes('integrated') &&
            !d.label.toLowerCase().includes('built-in')
          )
        ) || availableCameras[0] // fallback to first camera
      }

      if (!targetDevice) {
        toast.error('No suitable camera found')
        setScanning(false)
        return
      }

      console.log('Using camera:', targetDevice.label, 'ID:', targetDevice.deviceId)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: targetDevice.deviceId ? { exact: targetDevice.deviceId } : undefined,
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        // Start DL-enhanced frame scanning loop for camera input
        cameraFrameIntervalRef.current = setInterval(scanCameraFrameWithDL, 700)
      }
    } catch (error) {
      console.error('Camera access error:', error)
      toast.error('Failed to access camera. Please check permissions.')
      setScanning(false)
    }
  }

  // Stop camera scan and optionally process batch
  const stopCameraScan = async () => {
    stopCameraStream()
    if (codes.size > 0) {
      const codesArray = Array.from(codes)
      toast(`Stopping scan and processing ${codes.size} detected barcodes...`)
      await processBatchCodes(codesArray)
    } else {
      toast('No barcodes detected to process')
    }
  }

  // Process batch codes
  const processBatchCodes = async (codeArray) => {
    setProcessing(true)
    try {
      const response = await api.post('/books/batch-lookup', { codes: codeArray })
      const data = response.data
      if (data.success) {
        const foundBooks = data.data.results
          .filter(result => result.found)
          .map(result => result.book)
        setDetectedBooks(foundBooks)
        toast.success(
          `Processed ${codeArray.length} codes: ${foundBooks.length} found, ${data.data.missing} missing`
        )
      } else {
        toast.error('Failed to process barcodes')
      }
    } catch (error) {
      console.error('Batch processing error:', error)
      toast.error('Failed to process barcodes')
    } finally {
      setProcessing(false)
    }
  }

  // Clear all results
  const clearResults = () => {
    stopCameraStream()
    setCodes(new Set())
    setDetectedBooks([])
    setUploadedImage(null)
    setProcessing(false)
    scannedRef.current = new Map()
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast('Results cleared')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">📷 Shelf Scanner</h2>

        {loadError ? (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800">
            <p className="font-medium">{loadError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
            >
              Refresh page
            </button>
          </div>
        ) : (
          <>
            {/* Image Upload */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">📁 Upload Shelf Image</h3>
              <div className="mb-3 flex items-center gap-2">
                <input
                  id="dl-preprocess"
                  type="checkbox"
                  checked={dlPreprocessingEnabled}
                  onChange={(e) => setDlPreprocessingEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="dl-preprocess" className="text-sm text-gray-700">
                  Use deep-learning preprocessing before barcode extraction
                </label>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  📤 Choose Image
                </label>
                {processing && <span className="text-gray-600">🔄 Processing image...</span>}
              </div>
              {uploadedImage && (
                <div className="mt-4">
                  <img src={uploadedImage} alt="Uploaded shelf" className="max-w-md rounded-lg shadow-md" />
                </div>
              )}
            </div>

            {/* Live Camera Scan */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">📹 Live Camera Scan</h3>
              <div className="mb-3 flex items-center gap-2">
                <input
                  id="dl-camera-preprocess"
                  type="checkbox"
                  checked={dlCameraPreprocessingEnabled}
                  onChange={(e) => setDlCameraPreprocessingEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="dl-camera-preprocess" className="text-sm text-gray-700">
                  Use deep-learning preprocessing for live camera frames
                </label>
              </div>
              
              {/* Camera Selection */}
              {availableCameras.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📷 Select Camera:
                  </label>
                  <select
                    value={selectedCamera}
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableCameras.map((camera) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Camera ${camera.deviceId}`}
                        {camera.label && camera.label.toLowerCase().includes('usb') && ' 📹 USB'}
                        {camera.label && camera.label.toLowerCase().includes('external') && ' 📹 External'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="mb-6">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      height: "auto",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "2px solid #e5e7eb"
                    }}
                  />
                </div>
                <div className="flex space-x-4">
                  {!scanning ? (
                    <button
                      onClick={startCameraScan}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ▶️ Start Scan
                    </button>
                  ) : (
                    <button
                      onClick={stopCameraScan}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ⏹️ Stop Scan
                    </button>
                  )}
                  <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    🗑️ Clear Results
                  </button>
                </div>
              </div>
            </div>

            {/* Detected Codes */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">📊 Detected Barcodes ({codes.size})</h3>
              
              {/* Debug: Show actual codes content */}
              <div className="text-xs text-gray-400 mb-2">
                Debug: Codes = {[...codes].join(', ')}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                {codes.size > 0 ? (
                  [...codes].map((code, index) => (
                    <div key={`${code}-${index}`} className="flex items-center justify-between p-2 bg-white rounded border mb-2">
                      <span className="font-mono text-sm font-bold">{code}</span>
                      <span className="text-xs text-gray-500">Barcode #{index + 1}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No barcodes detected yet. Upload an image or start camera scan.
                  </p>
                )}
              </div>
            </div>

            {/* Detected Books */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-700">📚 Detected Books ({detectedBooks.length})</h3>
              <div className="space-y-4">
                {detectedBooks.length > 0 ? (
                  detectedBooks.map((book) => (
                    <div key={book._id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">{book.title}</h4>
                          <p className="text-sm text-gray-600">Author: {book.author}</p>
                          <p className="text-sm text-gray-600">Acc No: {book.accNo}</p>
                          <p className="text-sm text-gray-600">Department: {book.department}</p>
                          <p className="text-sm text-gray-600">Year: {book.publishedYear}</p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            book.status === 'Available'
                              ? 'bg-green-100 text-green-800'
                              : book.status === 'Issued'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {book.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No books detected yet. Scan barcodes to find books.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ShelfScanner;
