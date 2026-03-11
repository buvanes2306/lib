import express from 'express'
import auditController from '../controllers/auditController.js'

const router = express.Router()

// Start audit session
router.post('/start', auditController.startAuditSession)

// Scan shelf
router.post('/scan-shelf', auditController.scanShelf)

// Finalize audit
router.post('/finalize', auditController.finalizeAudit)

// Get audit report
router.get('/report/:auditSessionId', auditController.getAuditReport)

// Get all audit sessions
router.get('/sessions', auditController.getAuditSessions)

export default router
