import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, createProject);
router.put('/:id', authenticateToken, requireAdmin, updateProject);
router.delete('/:id', authenticateToken, requireAdmin, deleteProject);

export default router;
