import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.get('/', authenticateToken, getCart);
router.post('/items', authenticateToken, addToCart);
router.put('/items/:itemId', authenticateToken, updateCartItem);
router.delete('/items/:itemId', authenticateToken, removeFromCart);
router.delete('/', authenticateToken, clearCart);

export default router;