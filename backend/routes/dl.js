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
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''
    let responseSent = false

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

    pythonProc.on('error', (error) => {
      clearTimeout(killTimer)
      if (!responseSent) {
        responseSent = true
        console.error('Python process error:', error)
        return res.status(500).json({
          success: false,
          message: 'Failed to start Python process',
          error: error.message
        })
      }
    })

    pythonProc.stdin.on('error', (error) => {
      clearTimeout(killTimer)
      if (!responseSent) {
        responseSent = true
        console.error('Python stdin error:', error)
        pythonProc.kill()
        return res.status(500).json({
          success: false,
          message: 'Python process stdin error',
          error: error.message
        })
      }
    })

    pythonProc.on('close', (code) => {
      clearTimeout(killTimer)
      if (!responseSent) {
        responseSent = true
        if (code !== 0) {
          console.error(`Python process exited with code ${code}. stderr:`, stderr)
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
          console.error('Python response parse error:', parseError, 'stdout:', stdout)
          return res.status(500).json({
            success: false,
            message: 'Invalid Python response',
            error: parseError.message
          })
        }
      }
    })

    try {
      pythonProc.stdin.write(JSON.stringify({ imageBase64 }))
      pythonProc.stdin.end()
    } catch (writeError) {
      clearTimeout(killTimer)
      if (!responseSent) {
        responseSent = true
        console.error('Python stdin write error:', writeError)
        pythonProc.kill()
        return res.status(500).json({
          success: false,
          message: 'Python process write error',
          error: writeError.message
        })
      }
    }
  } catch (error) {
    console.error('DL scan frame error:', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
})

export default router
