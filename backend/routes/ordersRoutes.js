import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} from '../controllers/ordersController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes (require authentication)
router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getOrders);
router.get('/:id', authenticateToken, getOrderById);

// Admin routes
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.get('/admin/all', authenticateToken, requireAdmin, getAllOrders);

export default router;