import Paystack from 'paystack';
import { query, queryOne } from '../config/database.js';

// Initialize Paystack with secret key
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

/**
 * Initialize payment transaction
 * POST /api/payments/initialize
 */
export const initializePayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { amount, currency = 'GHS', email, orderId } = req.body;

    // Validation
    if (!amount || amount <= 0 || !email) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          amount: !amount || amount <= 0 ? 'Valid amount is required' : undefined,
          email: !email ? 'Email is required' : undefined
        }
      });
    }

    // If orderId is provided, verify the order belongs to the user
    if (orderId) {
      const order = queryOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if order already has a payment reference
      if (order.payment_intent_id) {
        return res.status(400).json({ 
          error: 'Order already has a payment reference',
          paymentReference: order.payment_intent_id
        });
      }
    }

    // Initialize Paystack transaction
    const response = await paystack.transaction.initialize({
      amount: Math.round(amount * 100), // Convert to pesewas (GHS) or kobo (NGN)
      currency: currency.toUpperCase(),
      email: email,
      metadata: {
        userId,
        orderId: orderId || 'cart_checkout'
      },
      callback_url: process.env.FRONTEND_URL + '/payment/callback'
    });

    if (response.status) {
      // If orderId provided, update the order with payment reference
      if (orderId) {
        query(
          'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
          [response.data.reference, orderId]
        );
      }

      res.json({
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference
      });
    } else {
      throw new Error(response.message || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('Paystack payment initialization failed:', error);
    next(error);
  }
};

/**
 * Verify payment and update order status
 * POST /api/payments/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ 
        error: 'Payment reference is required'
      });
    }

    // Verify transaction with Paystack
    const response = await paystack.transaction.verify(reference);

    if (response.status && response.data.status === 'success') {
      // Find and update the order
      const order = queryOne(
        'SELECT * FROM orders WHERE payment_intent_id = ?',
        [reference]
      );

      if (order) {
        query(
          'UPDATE orders SET status = ? WHERE id = ?',
          ['processing', order.id]
        );

        const updatedOrder = queryOne('SELECT * FROM orders WHERE id = ?', [order.id]);
        const formattedOrder = {
          ...updatedOrder,
          items: JSON.parse(updatedOrder.items),
          shipping_address: updatedOrder.shipping_address ? JSON.parse(updatedOrder.shipping_address) : null
        };

        res.json({
          success: true,
          order: formattedOrder,
          paymentStatus: response.data.status,
          amount: response.data.amount / 100, // Convert back from pesewas/kobo
          currency: response.data.currency
        });
      } else {
        res.json({
          success: true,
          paymentStatus: response.data.status,
          message: 'Payment verified but no associated order found'
        });
      }
    } else {
      res.status(400).json({
        error: 'Payment verification failed',
        paymentStatus: response.data?.status || 'unknown'
      });
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    next(error);
  }
};

/**
 * Handle Paystack webhooks
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res, next) => {
  const hash = req.headers['x-paystack-signature'];
  const secret = process.env.PAYSTACK_SECRET_KEY;

  try {
    // Verify webhook signature
    const crypto = await import('crypto');
    const expectedHash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    
    if (hash !== expectedHash) {
      console.error('Webhook signature verification failed');
      return res.status(400).send('Webhook signature verification failed');
    }

    const event = req.body;

    // Handle the event
    switch (event.event) {
      case 'charge.success':
        const transaction = event.data;
        console.log('Payment succeeded:', transaction.reference);

        // Update order status
        const order = queryOne(
          'SELECT * FROM orders WHERE payment_intent_id = ?',
          [transaction.reference]
        );

        if (order && order.status === 'pending') {
          query(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['processing', order.id]
          );
          console.log('Order status updated to processing:', order.id);
        }
        break;

      case 'charge.failed':
        const failedTransaction = event.data;
        console.log('Payment failed:', failedTransaction.reference);

        // Update order status to failed
        const failedOrder = queryOne(
          'SELECT * FROM orders WHERE payment_intent_id = ?',
          [failedTransaction.reference]
        );

        if (failedOrder) {
          query(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['cancelled', failedOrder.id]
          );
          console.log('Order status updated to cancelled:', failedOrder.id);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Get transaction status
 * GET /api/payments/transaction/:reference
 */
export const getTransactionStatus = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const response = await paystack.transaction.verify(reference);

    if (response.status) {
      res.json({
        reference: response.data.reference,
        status: response.data.status,
        amount: response.data.amount / 100, // Convert back from pesewas/kobo
        currency: response.data.currency,
        metadata: response.data.metadata,
        paid_at: response.data.paid_at
      });
    } else {
      res.status(404).json({
        error: 'Transaction not found'
      });
    }
  } catch (error) {
    console.error('Failed to retrieve transaction:', error);
    next(error);
  }
};