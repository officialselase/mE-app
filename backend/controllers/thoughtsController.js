import { query, queryOne } from '../config/database.js';

/**
 * Get all thoughts with pagination and filtering
 * GET /api/thoughts?page=1&limit=10&featured=true
 */
export const getThoughts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const featured = req.query.featured === 'true';
    const offset = (page - 1) * limit;

    // Build query
    let sql = 'SELECT * FROM thoughts';
    const params = [];

    if (featured) {
      sql += ' WHERE featured = 1';
    }

    // Get total count
    const countSql = featured 
      ? 'SELECT COUNT(*) as total FROM thoughts WHERE featured = 1'
      : 'SELECT COUNT(*) as total FROM thoughts';
    const countResult = queryOne(countSql);
    const total = countResult.total;

    // Add ordering and pagination
    sql += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = query(sql, params);
    const thoughts = result.rows.map(thought => ({
      ...thought,
      tags: thought.tags ? JSON.parse(thought.tags) : [],
      featured: Boolean(thought.featured)
    }));

    res.json({
      thoughts,
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
 * Get single thought by ID
 * GET /api/thoughts/:id
 */
export const getThoughtById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const thought = queryOne('SELECT * FROM thoughts WHERE id = ?', [id]);

    if (!thought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    // Parse JSON fields
    const formattedThought = {
      ...thought,
      tags: thought.tags ? JSON.parse(thought.tags) : [],
      featured: Boolean(thought.featured)
    };

    res.json(formattedThought);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new thought (admin only)
 * POST /api/thoughts
 */
export const createThought = async (req, res, next) => {
  try {
    const {
      title,
      snippet,
      content,
      date,
      featured,
      tags
    } = req.body;

    // Validation
    if (!title || !snippet || !content) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          title: !title ? 'Title is required' : undefined,
          snippet: !snippet ? 'Snippet is required' : undefined,
          content: !content ? 'Content is required' : undefined
        }
      });
    }

    const sql = `
      INSERT INTO thoughts (
        title, snippet, content, date, featured, tags
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      title,
      snippet,
      content,
      date || new Date().toISOString(),
      featured ? 1 : 0,
      tags ? JSON.stringify(tags) : null
    ];

    const result = query(sql, params);
    const newThought = queryOne('SELECT * FROM thoughts WHERE id = ?', [result.lastID]);

    // Format response
    const formattedThought = {
      ...newThought,
      tags: newThought.tags ? JSON.parse(newThought.tags) : [],
      featured: Boolean(newThought.featured)
    };

    res.status(201).json(formattedThought);
  } catch (error) {
    next(error);
  }
};

/**
 * Update thought (admin only)
 * PUT /api/thoughts/:id
 */
export const updateThought = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      snippet,
      content,
      date,
      featured,
      tags
    } = req.body;

    // Check if thought exists
    const existingThought = queryOne('SELECT * FROM thoughts WHERE id = ?', [id]);
    if (!existingThought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    const sql = `
      UPDATE thoughts SET
        title = ?,
        snippet = ?,
        content = ?,
        date = ?,
        featured = ?,
        tags = ?
      WHERE id = ?
    `;

    const params = [
      title !== undefined ? title : existingThought.title,
      snippet !== undefined ? snippet : existingThought.snippet,
      content !== undefined ? content : existingThought.content,
      date !== undefined ? date : existingThought.date,
      featured !== undefined ? (featured ? 1 : 0) : existingThought.featured,
      tags !== undefined ? JSON.stringify(tags) : existingThought.tags,
      id
    ];

    query(sql, params);
    const updatedThought = queryOne('SELECT * FROM thoughts WHERE id = ?', [id]);

    // Format response
    const formattedThought = {
      ...updatedThought,
      tags: updatedThought.tags ? JSON.parse(updatedThought.tags) : [],
      featured: Boolean(updatedThought.featured)
    };

    res.json(formattedThought);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete thought (admin only)
 * DELETE /api/thoughts/:id
 */
export const deleteThought = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if thought exists
    const existingThought = queryOne('SELECT * FROM thoughts WHERE id = ?', [id]);
    if (!existingThought) {
      return res.status(404).json({ error: 'Thought not found' });
    }

    query('DELETE FROM thoughts WHERE id = ?', [id]);

    res.json({ message: 'Thought deleted successfully' });
  } catch (error) {
    next(error);
  }
};
