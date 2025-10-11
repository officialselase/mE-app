import { query, queryOne } from '../config/database.js';

/**
 * Get user's cart
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let cart = queryOne('SELECT * FROM carts WHERE user_id = ?', [userId]);

    if (!cart) {
      // Create empty cart if none exists
      const result = query('INSERT INTO carts (user_id, items) VALUES (?, ?)', [userId, '[]']);
      cart = queryOne('SELECT * FROM carts WHERE id = ?', [result.lastID]);
    }

    // Parse items JSON
    const formattedCart = {
      ...cart,
      items: cart.items ? JSON.parse(cart.items) : []
    };

    res.json(formattedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    // Validation
    if (!productId || quantity <= 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          productId: !productId ? 'Product ID is required' : undefined,
          quantity: quantity <= 0 ? 'Quantity must be positive' : undefined
        }
      });
    }

    // Check if product exists
    const product = queryOne('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: product.stock
      });
    }

    // Get or create cart
    let cart = queryOne('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      const result = query('INSERT INTO carts (user_id, items) VALUES (?, ?)', [userId, '[]']);
      cart = queryOne('SELECT * FROM carts WHERE id = ?', [result.lastID]);
    }

    // Parse current items
    const items = cart.items ? JSON.parse(cart.items) : [];

    // Check if item already exists in cart
    const existingItemIndex = items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = items[existingItemIndex].quantity + quantity;
      
      // Check total stock availability
      if (product.stock < newQuantity) {
        return res.status(400).json({ 
          error: 'Insufficient stock for total quantity',
          available: product.stock,
          currentInCart: items[existingItemIndex].quantity
        });
      }

      items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      items.push({
        id: Date.now().toString(), // Simple ID for cart item
        productId,
        quantity,
        price: product.price,
        title: product.title
      });
    }

    // Update cart
    query('UPDATE carts SET items = ? WHERE id = ?', [JSON.stringify(items), cart.id]);

    // Get updated cart
    const updatedCart = queryOne('SELECT * FROM carts WHERE id = ?', [cart.id]);
    const formattedCart = {
      ...updatedCart,
      items: JSON.parse(updatedCart.items)
    };

    res.json(formattedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/items/:itemId
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validation
    if (quantity <= 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          quantity: 'Quantity must be positive'
        }
      });
    }

    // Get cart
    const cart = queryOne('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Parse items
    const items = cart.items ? JSON.parse(cart.items) : [];
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Check product stock
    const product = queryOne('SELECT * FROM products WHERE id = ?', [items[itemIndex].productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: product.stock
      });
    }

    // Update quantity
    items[itemIndex].quantity = quantity;

    // Update cart
    query('UPDATE carts SET items = ? WHERE id = ?', [JSON.stringify(items), cart.id]);

    // Get updated cart
    const updatedCart = queryOne('SELECT * FROM carts WHERE id = ?', [cart.id]);
    const formattedCart = {
      ...updatedCart,
      items: JSON.parse(updatedCart.items)
    };

    res.json(formattedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Get cart
    const cart = queryOne('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Parse items
    const items = cart.items ? JSON.parse(cart.items) : [];
    const filteredItems = items.filter(item => item.id !== itemId);

    if (filteredItems.length === items.length) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Update cart
    query('UPDATE carts SET items = ? WHERE id = ?', [JSON.stringify(filteredItems), cart.id]);

    // Get updated cart
    const updatedCart = queryOne('SELECT * FROM carts WHERE id = ?', [cart.id]);
    const formattedCart = {
      ...updatedCart,
      items: JSON.parse(updatedCart.items)
    };

    res.json(formattedCart);
  } catch (error) {
    next(error);
  }
};

/**
 * Clear cart
 * DELETE /api/cart
 */
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get cart
    const cart = queryOne('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Clear items
    query('UPDATE carts SET items = ? WHERE id = ?', ['[]', cart.id]);

    // Get updated cart
    const updatedCart = queryOne('SELECT * FROM carts WHERE id = ?', [cart.id]);
    const formattedCart = {
      ...updatedCart,
      items: []
    };

    res.json(formattedCart);
  } catch (error) {
    next(error);
  }
};