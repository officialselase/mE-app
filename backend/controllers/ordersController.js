import { query, queryOne } from '../config/database.js';

/**
 * Create new order
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items,
      subtotal,
      tax = 0,
      shipping = 0,
      total,
      shippingAddress,
      paymentIntentId
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          items: 'Items array is required and cannot be empty'
        }
      });
    }

    if (!subtotal || !total || subtotal < 0 || total < 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          subtotal: !subtotal || subtotal < 0 ? 'Valid subtotal is required' : undefined,
          total: !total || total < 0 ? 'Valid total is required' : undefined
        }
      });
    }

    // Validate items and check stock
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          error: 'Invalid item in order',
          item
        });
      }

      const product = queryOne('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (!product) {
        return res.status(404).json({ 
          error: 'Product not found',
          productId: item.productId
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock',
          productId: item.productId,
          available: product.stock,
          requested: item.quantity
        });
      }
    }

    const sql = `
      INSERT INTO orders (
        user_id, items, subtotal, tax, shipping, total,
        shipping_address, payment_intent_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      JSON.stringify(items),
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress ? JSON.stringify(shippingAddress) : null,
      paymentIntentId || null,
      'pending'
    ];

    const result = query(sql, params);
    const newOrder = queryOne('SELECT * FROM orders WHERE id = ?', [result.lastID]);

    // Update product stock
    for (const item of items) {
      query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    // Clear user's cart after successful order
    query('UPDATE carts SET items = ? WHERE user_id = ?', ['[]', userId]);

    // Format response
    const formattedOrder = {
      ...newOrder,
      items: JSON.parse(newOrder.items),
      shipping_address: newOrder.shipping_address ? JSON.parse(newOrder.shipping_address) : null
    };

    res.status(201).json(formattedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's orders
 * GET /api/orders
 */
export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = queryOne('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]);
    const total = countResult.total;

    // Get orders
    const result = query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    const orders = result.rows.map(order => ({
      ...order,
      items: JSON.parse(order.items),
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null
    }));

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = queryOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format response
    const formattedOrder = {
      ...order,
      items: JSON.parse(order.items),
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null
    };

    res.json(formattedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status (admin only)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses
      });
    }

    // Check if order exists
    const existingOrder = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status
    query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // Get updated order
    const updatedOrder = queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    const formattedOrder = {
      ...updatedOrder,
      items: JSON.parse(updatedOrder.items),
      shipping_address: updatedOrder.shipping_address ? JSON.parse(updatedOrder.shipping_address) : null
    };

    res.json(formattedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all orders (admin only)
 * GET /api/admin/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const offset = (page - 1) * limit;

    // Build query
    let sql = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM orders';
    if (status) {
      countSql += ' WHERE status = ?';
    }
    const countResult = queryOne(countSql, status ? [status] : []);
    const total = countResult.total;

    // Add ordering and pagination
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = query(sql, params);
    const orders = result.rows.map(order => ({
      ...order,
      items: JSON.parse(order.items),
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null
    }));

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};