import express from 'express';
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBookStats,
  getDashboardStats,
  updateBookStatus,
  batchLookupBooks
} from '../controllers/bookController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validateBook } from '../middleware/validation.js';

const router = express.Router();

router.get('/', optionalAuth, getBooks);
router.get('/dashboard-stats', getDashboardStats);
router.get('/stats', authenticate, authorize('admin'), getBookStats);
router.get('/:id', optionalAuth, getBookById);

router.post('/', authenticate, authorize('admin'), validateBook, createBook);
router.put('/:id', authenticate, authorize('admin'), validateBook, updateBook);
router.patch('/:id/status', authenticate, authorize('admin'), updateBookStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteBook);
router.post('/batch-lookup', optionalAuth, batchLookupBooks);

export default router;
