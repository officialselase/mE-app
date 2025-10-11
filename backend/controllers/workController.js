import { query, queryOne } from '../config/database.js';

/**
 * Get all work experience entries
 * GET /api/work
 */
export const getWorkExperience = async (req, res, next) => {
  try {
    // Get all work experience ordered by start_date (most recent first)
    // and then by display_order
    const sql = `
      SELECT * FROM work_experience 
      ORDER BY start_date DESC, display_order ASC
    `;

    const result = query(sql);
    const workExperience = result.rows.map(work => ({
      ...work,
      technologies: work.technologies ? JSON.parse(work.technologies) : [],
      current: Boolean(work.current)
    }));

    res.json(workExperience);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single work experience entry by ID
 * GET /api/work/:id
 */
export const getWorkExperienceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const work = queryOne('SELECT * FROM work_experience WHERE id = ?', [id]);

    if (!work) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    // Parse JSON fields
    const formattedWork = {
      ...work,
      technologies: work.technologies ? JSON.parse(work.technologies) : [],
      current: Boolean(work.current)
    };

    res.json(formattedWork);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new work experience entry (admin only)
 * POST /api/work
 */
export const createWorkExperience = async (req, res, next) => {
  try {
    const {
      company,
      position,
      description,
      start_date,
      end_date,
      current,
      technologies,
      display_order
    } = req.body;

    // Validation
    if (!company || !position || !description || !start_date) {
      return res.status(400).json({ 
        error: 'Validation failed',
        fields: {
          company: !company ? 'Company is required' : undefined,
          position: !position ? 'Position is required' : undefined,
          description: !description ? 'Description is required' : undefined,
          start_date: !start_date ? 'Start date is required' : undefined
        }
      });
    }

    const sql = `
      INSERT INTO work_experience (
        company, position, description, start_date, end_date,
        current, technologies, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      company,
      position,
      description,
      start_date,
      end_date || null,
      current ? 1 : 0,
      technologies ? JSON.stringify(technologies) : null,
      display_order || 0
    ];

    const result = query(sql, params);
    const newWork = queryOne('SELECT * FROM work_experience WHERE id = ?', [result.lastID]);

    // Format response
    const formattedWork = {
      ...newWork,
      technologies: newWork.technologies ? JSON.parse(newWork.technologies) : [],
      current: Boolean(newWork.current)
    };

    res.status(201).json(formattedWork);
  } catch (error) {
    next(error);
  }
};

/**
 * Update work experience entry (admin only)
 * PUT /api/work/:id
 */
export const updateWorkExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      company,
      position,
      description,
      start_date,
      end_date,
      current,
      technologies,
      display_order
    } = req.body;

    // Check if work experience exists
    const existingWork = queryOne('SELECT * FROM work_experience WHERE id = ?', [id]);
    if (!existingWork) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    const sql = `
      UPDATE work_experience SET
        company = ?,
        position = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        current = ?,
        technologies = ?,
        display_order = ?
      WHERE id = ?
    `;

    const params = [
      company !== undefined ? company : existingWork.company,
      position !== undefined ? position : existingWork.position,
      description !== undefined ? description : existingWork.description,
      start_date !== undefined ? start_date : existingWork.start_date,
      end_date !== undefined ? end_date : existingWork.end_date,
      current !== undefined ? (current ? 1 : 0) : existingWork.current,
      technologies !== undefined ? JSON.stringify(technologies) : existingWork.technologies,
      display_order !== undefined ? display_order : existingWork.display_order,
      id
    ];

    query(sql, params);
    const updatedWork = queryOne('SELECT * FROM work_experience WHERE id = ?', [id]);

    // Format response
    const formattedWork = {
      ...updatedWork,
      technologies: updatedWork.technologies ? JSON.parse(updatedWork.technologies) : [],
      current: Boolean(updatedWork.current)
    };

    res.json(formattedWork);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete work experience entry (admin only)
 * DELETE /api/work/:id
 */
export const deleteWorkExperience = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if work experience exists
    const existingWork = queryOne('SELECT * FROM work_experience WHERE id = ?', [id]);
    if (!existingWork) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    query('DELETE FROM work_experience WHERE id = ?', [id]);

    res.json({ message: 'Work experience deleted successfully' });
  } catch (error) {
    next(error);
  }
};
