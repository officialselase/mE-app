import express from 'express';
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getTransactionStatus
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Payment routes (require authentication)
router.post('/initialize', authenticateToken, initializePayment);
router.post('/verify', authenticateToken, verifyPayment);
router.get('/transaction/:reference', authenticateToken, getTransactionStatus);

// Webhook route (no authentication - Paystack handles verification)
// Note: This route should use raw body parser, not JSON parser
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;