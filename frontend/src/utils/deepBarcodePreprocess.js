let tfRef = null

const TF_SCRIPT_ID = 'tfjs-cdn-script'
const TF_CDN_URL = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js'

const loadTfFromCdn = () =>
  new Promise((resolve, reject) => {
    if (window.tf) {
      resolve(window.tf)
      return
    }

    const existing = document.getElementById(TF_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.tf))
      existing.addEventListener('error', () => reject(new Error('Failed to load TensorFlow.js')))
      return
    }

    const script = document.createElement('script')
    script.id = TF_SCRIPT_ID
    script.src = TF_CDN_URL
    script.async = true
    script.onload = () => resolve(window.tf)
    script.onerror = () => reject(new Error('Failed to load TensorFlow.js from CDN'))
    document.head.appendChild(script)
  })

const ensureTf = async () => {
  if (tfRef) return tfRef
  const tf = await loadTfFromCdn()
  tfRef = tf
  return tf
}

const tensorToCanvas = async (tensor) => {
  const [height, width] = tensor.shape
  const data = await tensor.data()
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)

  for (let i = 0; i < width * height; i++) {
    const v = Math.max(0, Math.min(255, Math.round(data[i] * 255)))
    const p = i * 4
    imageData.data[p] = v
    imageData.data[p + 1] = v
    imageData.data[p + 2] = v
    imageData.data[p + 3] = 255
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

const getImageTensor = (tf, imageEl) => {
  return tf.tidy(() => {
    const rgb = tf.browser.fromPixels(imageEl).toFloat().div(255)
    const grayscale = rgb.mean(2).expandDims(2)
    return grayscale
  })
}

const applyCnnStyleEnhancement = (tf, grayscale) => {
  return tf.tidy(() => {
    const batched = grayscale.expandDims(0)

    // CNN-style denoise and edge boost path for barcodes
    const blurKernel = tf.tensor4d(
      [
        1 / 16, 2 / 16, 1 / 16,
        2 / 16, 4 / 16, 2 / 16,
        1 / 16, 2 / 16, 1 / 16
      ],
      [3, 3, 1, 1]
    )
    const sharpenKernel = tf.tensor4d(
      [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ],
      [3, 3, 1, 1]
    )

    const denoised = tf.conv2d(batched, blurKernel, 1, 'same')
    const sharpened = tf.conv2d(denoised, sharpenKernel, 1, 'same')
    const upscaled = tf.image.resizeBilinear(
      sharpened,
      [grayscale.shape[0] * 2, grayscale.shape[1] * 2],
      true
    )
    const normalized = upscaled.clipByValue(0, 1)

    return normalized.squeeze([0, 3])
  })
}

export const preprocessBarcodeImage = async (imageEl) => {
  const tf = await ensureTf()
  const grayscale = getImageTensor(tf, imageEl)
  const enhanced = applyCnnStyleEnhancement(tf, grayscale)
  const canvas = await tensorToCanvas(enhanced)
  grayscale.dispose()
  enhanced.dispose()
  return canvas
}
