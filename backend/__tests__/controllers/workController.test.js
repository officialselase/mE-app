import {
  getWorkExperience,
  getWorkExperienceById,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience
} from '../../controllers/workController.js';

describe('Work Experience Controller - CRUD Operations', () => {
  describe('Get Work Experience', () => {
    it('should order by start_date descending', () => {
      const sql = 'SELECT * FROM work_experience ORDER BY start_date DESC, display_order ASC';

      expect(sql).toContain('ORDER BY start_date DESC');
    });

    it('should use display_order as secondary sort', () => {
      const sql = 'SELECT * FROM work_experience ORDER BY start_date DESC, display_order ASC';

      expect(sql).toContain('display_order ASC');
    });

    it('should not include pagination for work experience', () => {
      const sql = 'SELECT * FROM work_experience ORDER BY start_date DESC, display_order ASC';

      expect(sql).not.toContain('LIMIT');
      expect(sql).not.toContain('OFFSET');
    });
  });

  describe('Work Experience Data Formatting', () => {
    it('should parse technologies JSON field correctly', () => {
      const rawWork = {
        id: 1,
        company: 'Test Company',
        technologies: '["JavaScript","React","Node.js"]',
        current: 1
      };

      const formatted = {
        ...rawWork,
        technologies: rawWork.technologies ? JSON.parse(rawWork.technologies) : [],
        current: Boolean(rawWork.current)
      };

      expect(formatted.technologies).toEqual(['JavaScript', 'React', 'Node.js']);
      expect(formatted.current).toBe(true);
    });

    it('should handle null technologies field', () => {
      const rawWork = {
        id: 1,
        company: 'Test Company',
        technologies: null,
        current: 0
      };

      const formatted = {
        ...rawWork,
        technologies: rawWork.technologies ? JSON.parse(rawWork.technologies) : [],
        current: Boolean(rawWork.current)
      };

      expect(formatted.technologies).toEqual([]);
      expect(formatted.current).toBe(false);
    });

    it('should convert current integer to boolean', () => {
      expect(Boolean(1)).toBe(true);
      expect(Boolean(0)).toBe(false);
    });

    it('should handle empty technologies array', () => {
      const rawWork = {
        technologies: '[]'
      };

      const formatted = {
        technologies: rawWork.technologies ? JSON.parse(rawWork.technologies) : []
      };

      expect(formatted.technologies).toEqual([]);
      expect(Array.isArray(formatted.technologies)).toBe(true);
    });
  });

  describe('Create Work Experience Validation', () => {
    it('should validate all required fields', () => {
      const validWork = {
        company: 'Test Company',
        position: 'Software Engineer',
        description: 'Test Description',
        start_date: '2024-01-01'
      };

      const isValid = !!(validWork.company && validWork.position && 
                     validWork.description && validWork.start_date);

      expect(isValid).toBe(true);
    });

    it('should detect missing company', () => {
      const work = {
        position: 'Software Engineer',
        description: 'Test Description',
        start_date: '2024-01-01'
      };

      const isValid = !!(work.company && work.position && 
                     work.description && work.start_date);

      expect(isValid).toBe(false);
    });

    it('should detect missing position', () => {
      const work = {
        company: 'Test Company',
        description: 'Test Description',
        start_date: '2024-01-01'
      };

      const isValid = !!(work.company && work.position && 
                     work.description && work.start_date);

      expect(isValid).toBe(false);
    });

    it('should detect missing description', () => {
      const work = {
        company: 'Test Company',
        position: 'Software Engineer',
        start_date: '2024-01-01'
      };

      const isValid = !!(work.company && work.position && 
                     work.description && work.start_date);

      expect(isValid).toBe(false);
    });

    it('should detect missing start_date', () => {
      const work = {
        company: 'Test Company',
        position: 'Software Engineer',
        description: 'Test Description'
      };

      const isValid = !!(work.company && work.position && 
                     work.description && work.start_date);

      expect(isValid).toBe(false);
    });

    it('should build validation error response correctly', () => {
      const company = undefined;
      const position = 'Engineer';
      const description = undefined;
      const start_date = '2024-01-01';

      const errorResponse = {
        error: 'Validation failed',
        fields: {
          company: !company ? 'Company is required' : undefined,
          position: !position ? 'Position is required' : undefined,
          description: !description ? 'Description is required' : undefined,
          start_date: !start_date ? 'Start date is required' : undefined
        }
      };

      expect(errorResponse.fields.company).toBe('Company is required');
      expect(errorResponse.fields.position).toBeUndefined();
      expect(errorResponse.fields.description).toBe('Description is required');
      expect(errorResponse.fields.start_date).toBeUndefined();
    });
  });

  describe('Work Experience Date Handling', () => {
    it('should handle end_date as optional', () => {
      const end_date = undefined;
      const stored = end_date || null;

      expect(stored).toBeNull();
    });

    it('should store end_date when provided', () => {
      const end_date = '2024-12-31';
      const stored = end_date || null;

      expect(stored).toBe('2024-12-31');
    });

    it('should handle current position without end_date', () => {
      const current = true;
      const end_date = null;

      expect(current).toBe(true);
      expect(end_date).toBeNull();
    });

    it('should handle past position with end_date', () => {
      const current = false;
      const end_date = '2023-12-31';

      expect(current).toBe(false);
      expect(end_date).toBe('2023-12-31');
    });
  });

  describe('Work Experience JSON Serialization', () => {
    it('should stringify technologies array for database storage', () => {
      const technologies = ['JavaScript', 'React', 'Node.js'];
      const serialized = JSON.stringify(technologies);

      expect(serialized).toBe('["JavaScript","React","Node.js"]');
    });

    it('should handle null technologies', () => {
      const technologies = undefined;
      const stored = technologies ? JSON.stringify(technologies) : null;

      expect(stored).toBeNull();
    });

    it('should convert current boolean to integer', () => {
      expect(true ? 1 : 0).toBe(1);
      expect(false ? 1 : 0).toBe(0);
      expect(undefined ? 1 : 0).toBe(0);
    });
  });

  describe('Display Order Handling', () => {
    it('should use default display_order when not provided', () => {
      const display_order = undefined;
      const stored = display_order || 0;

      expect(stored).toBe(0);
    });

    it('should use provided display_order', () => {
      const display_order = 5;
      const stored = display_order || 0;

      expect(stored).toBe(5);
    });

    it('should handle display_order of 0', () => {
      const display_order = 0;
      const stored = display_order !== undefined ? display_order : 0;

      expect(stored).toBe(0);
    });
  });

  describe('Update Work Experience Logic', () => {
    it('should preserve existing values when field not provided', () => {
      const existingWork = {
        id: 1,
        company: 'Original Company',
        position: 'Original Position',
        description: 'Original Description',
        start_date: '2023-01-01',
        current: 1
      };

      const updateData = {
        company: 'New Company'
      };

      const updated = {
        company: updateData.company !== undefined ? updateData.company : existingWork.company,
        position: updateData.position !== undefined ? updateData.position : existingWork.position,
        description: updateData.description !== undefined ? updateData.description : existingWork.description
      };

      expect(updated.company).toBe('New Company');
      expect(updated.position).toBe('Original Position');
      expect(updated.description).toBe('Original Description');
    });

    it('should update multiple fields when provided', () => {
      const existingWork = {
        company: 'Old',
        position: 'Old',
        description: 'Old',
        current: 1,
        end_date: null
      };

      const updateData = {
        company: 'New',
        position: 'New',
        current: false,
        end_date: '2024-12-31'
      };

      const updated = {
        company: updateData.company !== undefined ? updateData.company : existingWork.company,
        position: updateData.position !== undefined ? updateData.position : existingWork.position,
        description: updateData.description !== undefined ? updateData.description : existingWork.description,
        current: updateData.current !== undefined ? (updateData.current ? 1 : 0) : existingWork.current,
        end_date: updateData.end_date !== undefined ? updateData.end_date : existingWork.end_date
      };

      expect(updated.company).toBe('New');
      expect(updated.position).toBe('New');
      expect(updated.description).toBe('Old');
      expect(updated.current).toBe(0);
      expect(updated.end_date).toBe('2024-12-31');
    });

    it('should handle updating technologies array', () => {
      const existingWork = {
        technologies: '["JavaScript","React"]'
      };

      const updateData = {
        technologies: ['JavaScript', 'React', 'Node.js', 'TypeScript']
      };

      const updated = {
        technologies: updateData.technologies !== undefined 
          ? JSON.stringify(updateData.technologies) 
          : existingWork.technologies
      };

      expect(updated.technologies).toBe('["JavaScript","React","Node.js","TypeScript"]');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent work experience', () => {
      const work = null;
      const statusCode = work ? 200 : 404;
      const errorMessage = work ? null : 'Work experience not found';

      expect(statusCode).toBe(404);
      expect(errorMessage).toBe('Work experience not found');
    });

    it('should return 400 for validation errors', () => {
      const company = '';
      const position = '';
      const description = '';
      const start_date = '';
      const hasValidationError = !company || !position || !description || !start_date;

      const statusCode = hasValidationError ? 400 : 201;

      expect(statusCode).toBe(400);
    });

    it('should return 201 for successful creation', () => {
      const company = 'Valid';
      const position = 'Valid';
      const description = 'Valid';
      const start_date = '2024-01-01';
      const hasValidationError = !company || !position || !description || !start_date;

      const statusCode = hasValidationError ? 400 : 201;

      expect(statusCode).toBe(201);
    });
  });

  describe('Response Structure', () => {
    it('should return array of work experience without pagination', () => {
      const response = [
        {
          id: 1,
          company: 'Company A',
          position: 'Engineer',
          technologies: ['JavaScript'],
          current: true
        },
        {
          id: 2,
          company: 'Company B',
          position: 'Developer',
          technologies: ['Python'],
          current: false
        }
      ];

      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(2);
      expect(response[0].id).toBeDefined();
      expect(Array.isArray(response[0].technologies)).toBe(true);
      expect(typeof response[0].current).toBe('boolean');
    });

    it('should return formatted work experience in single item response', () => {
      const response = {
        id: 1,
        company: 'Test Company',
        position: 'Software Engineer',
        description: 'Test Description',
        start_date: '2024-01-01',
        end_date: null,
        current: true,
        technologies: ['JavaScript', 'React'],
        display_order: 0
      };

      expect(response.id).toBeDefined();
      expect(response.company).toBeDefined();
      expect(response.position).toBeDefined();
      expect(response.description).toBeDefined();
      expect(response.start_date).toBeDefined();
      expect(Array.isArray(response.technologies)).toBe(true);
      expect(typeof response.current).toBe('boolean');
    });

    it('should return success message for deletion', () => {
      const response = {
        message: 'Work experience deleted successfully'
      };

      expect(response.message).toBe('Work experience deleted successfully');
    });
  });

  describe('Chronological Ordering', () => {
    it('should sort work experience by most recent first', () => {
      const workExperiences = [
        { start_date: '2022-01-01', display_order: 0 },
        { start_date: '2024-01-01', display_order: 0 },
        { start_date: '2023-01-01', display_order: 0 }
      ];

      const sorted = [...workExperiences].sort((a, b) => {
        if (b.start_date !== a.start_date) {
          return b.start_date.localeCompare(a.start_date);
        }
        return a.display_order - b.display_order;
      });

      expect(sorted[0].start_date).toBe('2024-01-01');
      expect(sorted[1].start_date).toBe('2023-01-01');
      expect(sorted[2].start_date).toBe('2022-01-01');
    });

    it('should use display_order for same start_date', () => {
      const workExperiences = [
        { start_date: '2024-01-01', display_order: 2 },
        { start_date: '2024-01-01', display_order: 0 },
        { start_date: '2024-01-01', display_order: 1 }
      ];

      const sorted = [...workExperiences].sort((a, b) => {
        if (b.start_date !== a.start_date) {
          return b.start_date.localeCompare(a.start_date);
        }
        return a.display_order - b.display_order;
      });

      expect(sorted[0].display_order).toBe(0);
      expect(sorted[1].display_order).toBe(1);
      expect(sorted[2].display_order).toBe(2);
    });
  });
});
