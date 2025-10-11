import express from 'express';
import {
  getAssignmentById,
  submitAssignment,
  updateSubmission,
  deleteSubmission,
  getAssignmentSubmissions,
  getMySubmissions,
  addSubmissionComment,
  getSubmissionComments
} from '../controllers/assignmentsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Assignment routes
router.get('/:id', getAssignmentById);
router.post('/:id/submit', submitAssignment);
router.get('/:id/submissions', getAssignmentSubmissions);

// Submission routes
router.put('/submissions/:id', updateSubmission);
router.delete('/submissions/:id', deleteSubmission);
router.get('/submissions/my-submissions', getMySubmissions);

// Comment routes
router.post('/submissions/:id/comments', addSubmissionComment);
router.get('/submissions/:id/comments', getSubmissionComments);

export default router;