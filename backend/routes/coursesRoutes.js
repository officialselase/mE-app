import express from 'express';
import {
  getCourses,
  getCourseById,
  enrollInCourse,
  getCourseProgress,
  markLessonComplete,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/coursesController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Student routes
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/:id/enroll', enrollInCourse);
router.get('/:id/progress', getCourseProgress);

// Lesson completion route
router.put('/lessons/:id/complete', markLessonComplete);

// Instructor/Admin routes
router.post('/', requireRole(['instructor', 'admin']), createCourse);
router.put('/:id', requireRole(['instructor', 'admin']), updateCourse);
router.delete('/:id', requireRole(['instructor', 'admin']), deleteCourse);

export default router;