import { query, queryOne } from '../config/database.js';

/**
 * Get all products with pagination and filtering
 * GET /api/products?page=1&limit=20&featured=true&category=electronics
 */
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const featured = req.query.featured === 'true';
    const category = req.query.category;
    const offset = (page - 1) * limit;

    // Build query
    let sql = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (featured) {
      conditions.push('featured = 1');
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM products';
    if (conditions.length > 0) {
      countSql += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = queryOne(countSql, params);
    const total = countResult.total;

    // Add ordering and pagination
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = query(sql, params);
    const products = result.rows.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      featured: Boolean(product.featured)
    }));

    res.json({
      products,
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
 * Get single product by ID
 * GET /api/products/:id
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = queryOne('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Parse JSON fields
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      featured: Boolean(product.featured)
    };

    res.json(formattedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product (admin only)
 * POST /api/products
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      currency,
      images,
      category,
      stock,
      featured
    } = req.body;

    // Validation
    if (!title || !description || price === undefined || price < 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          title: !title ? 'Title is required' : undefined,
          description: !description ? 'Description is required' : undefined,
          price: price === undefined ? 'Price is required' : (price < 0 ? 'Price must be non-negative' : undefined)
        }
      });
    }

    const sql = `
      INSERT INTO products (
        title, description, price, currency, images, category, stock, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      title,
      description,
      price,
      currency || 'USD',
      images ? JSON.stringify(images) : null,
      category || null,
      stock || 0,
      featured ? 1 : 0
    ];

    const result = query(sql, params);
    const newProduct = queryOne('SELECT * FROM products WHERE id = ?', [result.lastID]);

    // Format response
    const formattedProduct = {
      ...newProduct,
      images: newProduct.images ? JSON.parse(newProduct.images) : [],
      featured: Boolean(newProduct.featured)
    };

    res.status(201).json(formattedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Update product (admin only)
 * PUT /api/products/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      currency,
      images,
      category,
      stock,
      featured
    } = req.body;

    // Check if product exists
    const existingProduct = queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          price: 'Price must be non-negative'
        }
      });
    }

    const sql = `
      UPDATE products SET
        title = ?,
        description = ?,
        price = ?,
        currency = ?,
        images = ?,
        category = ?,
        stock = ?,
        featured = ?
      WHERE id = ?
    `;

    const params = [
      title !== undefined ? title : existingProduct.title,
      description !== undefined ? description : existingProduct.description,
      price !== undefined ? price : existingProduct.price,
      currency !== undefined ? currency : existingProduct.currency,
      images !== undefined ? JSON.stringify(images) : existingProduct.images,
      category !== undefined ? category : existingProduct.category,
      stock !== undefined ? stock : existingProduct.stock,
      featured !== undefined ? (featured ? 1 : 0) : existingProduct.featured,
      id
    ];

    query(sql, params);
    const updatedProduct = queryOne('SELECT * FROM products WHERE id = ?', [id]);

    // Format response
    const formattedProduct = {
      ...updatedProduct,
      images: updatedProduct.images ? JSON.parse(updatedProduct.images) : [],
      featured: Boolean(updatedProduct.featured)
    };

    res.json(formattedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product (admin only)
 * DELETE /api/products/:id
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    query('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};