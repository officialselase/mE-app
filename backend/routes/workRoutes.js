import express from 'express';
import {
  getWorkExperience,
  getWorkExperienceById,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience
} from '../controllers/workController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getWorkExperience);
router.get('/:id', getWorkExperienceById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, createWorkExperience);
router.put('/:id', authenticateToken, requireAdmin, updateWorkExperience);
router.delete('/:id', authenticateToken, requireAdmin, deleteWorkExperience);

export default router;
