import { query, queryOne } from '../config/database.js';

/**
 * Get all projects with pagination and filtering
 * GET /api/projects?page=1&limit=10&featured=true
 */
export const getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const featured = req.query.featured === 'true';
    const offset = (page - 1) * limit;

    // Build query
    let sql = 'SELECT * FROM projects';
    const params = [];

    if (featured) {
      sql += ' WHERE featured = 1';
    }

    // Get total count
    const countSql = featured 
      ? 'SELECT COUNT(*) as total FROM projects WHERE featured = 1'
      : 'SELECT COUNT(*) as total FROM projects';
    const countResult = queryOne(countSql);
    const total = countResult.total;

    // Add ordering and pagination
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = query(sql, params);
    const projects = result.rows.map(project => ({
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: Boolean(project.featured)
    }));

    res.json({
      projects,
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
 * Get single project by ID
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = queryOne('SELECT * FROM projects WHERE id = ?', [id]);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Parse JSON fields
    const formattedProject = {
      ...project,
      images: project.images ? JSON.parse(project.images) : [],
      technologies: project.technologies ? JSON.parse(project.technologies) : [],
      featured: Boolean(project.featured)
    };

    res.json(formattedProject);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new project (admin only)
 * POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      long_description,
      images,
      technologies,
      github_url,
      live_url,
      featured
    } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          title: !title ? 'Title is required' : undefined,
          description: !description ? 'Description is required' : undefined
        }
      });
    }

    const sql = `
      INSERT INTO projects (
        title, description, long_description, images, technologies,
        github_url, live_url, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      title,
      description,
      long_description || null,
      images ? JSON.stringify(images) : null,
      technologies ? JSON.stringify(technologies) : null,
      github_url || null,
      live_url || null,
      featured ? 1 : 0
    ];

    const result = query(sql, params);
    const newProject = queryOne('SELECT * FROM projects WHERE id = ?', [result.lastID]);

    // Format response
    const formattedProject = {
      ...newProject,
      images: newProject.images ? JSON.parse(newProject.images) : [],
      technologies: newProject.technologies ? JSON.parse(newProject.technologies) : [],
      featured: Boolean(newProject.featured)
    };

    res.status(201).json(formattedProject);
  } catch (error) {
    next(error);
  }
};

/**
 * Update project (admin only)
 * PUT /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      long_description,
      images,
      technologies,
      github_url,
      live_url,
      featured
    } = req.body;

    // Check if project exists
    const existingProject = queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const sql = `
      UPDATE projects SET
        title = ?,
        description = ?,
        long_description = ?,
        images = ?,
        technologies = ?,
        github_url = ?,
        live_url = ?,
        featured = ?
      WHERE id = ?
    `;

    const params = [
      title !== undefined ? title : existingProject.title,
      description !== undefined ? description : existingProject.description,
      long_description !== undefined ? long_description : existingProject.long_description,
      images !== undefined ? JSON.stringify(images) : existingProject.images,
      technologies !== undefined ? JSON.stringify(technologies) : existingProject.technologies,
      github_url !== undefined ? github_url : existingProject.github_url,
      live_url !== undefined ? live_url : existingProject.live_url,
      featured !== undefined ? (featured ? 1 : 0) : existingProject.featured,
      id
    ];

    query(sql, params);
    const updatedProject = queryOne('SELECT * FROM projects WHERE id = ?', [id]);

    // Format response
    const formattedProject = {
      ...updatedProject,
      images: updatedProject.images ? JSON.parse(updatedProject.images) : [],
      technologies: updatedProject.technologies ? JSON.parse(updatedProject.technologies) : [],
      featured: Boolean(updatedProject.featured)
    };

    res.json(formattedProject);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project (admin only)
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if project exists
    const existingProject = queryOne('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    query('DELETE FROM projects WHERE id = ?', [id]);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};
