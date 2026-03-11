import express from 'express'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..', '..')
const pythonScript = path.join(rootDir, 'python', 'barcode_dl_preprocess.py')
const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'py'

router.post('/scan-frame', async (req, res) => {
  try {
    const { imageBase64 } = req.body || {}
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'imageBase64 is required' })
    }

    const pythonProc = spawn(pythonExecutable, [pythonScript], {
      cwd: rootDir,
      windowsHide: true
    })

    let stdout = ''
    let stderr = ''

    pythonProc.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    pythonProc.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    const killTimer = setTimeout(() => {
      try {
        pythonProc.kill('SIGKILL')
      } catch (_) {}
    }, 15000)

    pythonProc.on('close', (code) => {
      clearTimeout(killTimer)
      if (code !== 0) {
        return res.status(500).json({
          success: false,
          message: 'Python preprocessing failed',
          error: stderr || `python exit code ${code}`
        })
      }

      try {
        const parsed = JSON.parse(stdout || '{}')
        return res.status(200).json(parsed)
      } catch (parseError) {
        return res.status(500).json({
          success: false,
          message: 'Invalid Python response',
          error: parseError.message
        })
      }
    })

    pythonProc.stdin.write(JSON.stringify({ imageBase64 }))
    pythonProc.stdin.end()
  } catch (error) {
    console.error('DL scan frame error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

export default router
