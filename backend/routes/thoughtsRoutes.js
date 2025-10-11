import express from 'express';
import {
  getThoughts,
  getThoughtById,
  createThought,
  updateThought,
  deleteThought
} from '../controllers/thoughtsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getThoughts);
router.get('/:id', getThoughtById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, createThought);
router.put('/:id', authenticateToken, requireAdmin, updateThought);
router.delete('/:id', authenticateToken, requireAdmin, deleteThought);

export default router;
