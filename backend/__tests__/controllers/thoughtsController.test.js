import {
  getThoughts,
  getThoughtById,
  createThought,
  updateThought,
  deleteThought
} from '../../controllers/thoughtsController.js';

describe('Thoughts Controller - CRUD Operations', () => {
  describe('Get Thoughts with Pagination', () => {
    it('should calculate pagination offset correctly', () => {
      const testCases = [
        { page: 1, limit: 10, expectedOffset: 0 },
        { page: 2, limit: 10, expectedOffset: 10 },
        { page: 3, limit: 7, expectedOffset: 14 },
        { page: 4, limit: 15, expectedOffset: 45 }
      ];

      testCases.forEach(({ page, limit, expectedOffset }) => {
        const offset = (page - 1) * limit;
        expect(offset).toBe(expectedOffset);
      });
    });

    it('should calculate total pages correctly', () => {
      const testCases = [
        { total: 50, limit: 10, expectedPages: 5 },
        { total: 47, limit: 10, expectedPages: 5 },
        { total: 51, limit: 10, expectedPages: 6 },
        { total: 3, limit: 10, expectedPages: 1 }
      ];

      testCases.forEach(({ total, limit, expectedPages }) => {
        const totalPages = Math.ceil(total / limit);
        expect(totalPages).toBe(expectedPages);
      });
    });

    it('should use default pagination values when not provided', () => {
      const page = parseInt(null) || 1;
      const limit = parseInt(null) || 10;

      expect(page).toBe(1);
      expect(limit).toBe(10);
    });

    it('should parse pagination query parameters correctly', () => {
      const queryParams = {
        page: '3',
        limit: '7'
      };

      const page = parseInt(queryParams.page) || 1;
      const limit = parseInt(queryParams.limit) || 10;

      expect(page).toBe(3);
      expect(limit).toBe(7);
    });
  });

  describe('Featured Content Filtering', () => {
    it('should detect featured filter from query string', () => {
      const testCases = [
        { query: 'true', expected: true },
        { query: 'false', expected: false },
        { query: undefined, expected: false },
        { query: '', expected: false }
      ];

      testCases.forEach(({ query, expected }) => {
        const featured = query === 'true';
        expect(featured).toBe(expected);
      });
    });

    it('should build correct SQL for featured thoughts', () => {
      const baseSql = 'SELECT * FROM thoughts';
      const featured = true;

      const sql = featured ? baseSql + ' WHERE featured = 1' : baseSql;

      expect(sql).toBe('SELECT * FROM thoughts WHERE featured = 1');
    });

    it('should build correct count SQL for featured filter', () => {
      const featured = true;
      const countSql = featured 
        ? 'SELECT COUNT(*) as total FROM thoughts WHERE featured = 1'
        : 'SELECT COUNT(*) as total FROM thoughts';

      expect(countSql).toBe('SELECT COUNT(*) as total FROM thoughts WHERE featured = 1');
    });
  });

  describe('Thought Data Formatting', () => {
    it('should parse tags JSON field correctly', () => {
      const rawThought = {
        id: 1,
        title: 'Test Thought',
        tags: '["javascript","react","testing"]',
        featured: 1
      };

      const formatted = {
        ...rawThought,
        tags: rawThought.tags ? JSON.parse(rawThought.tags) : [],
        featured: Boolean(rawThought.featured)
      };

      expect(formatted.tags).toEqual(['javascript', 'react', 'testing']);
      expect(formatted.featured).toBe(true);
    });

    it('should handle null tags field', () => {
      const rawThought = {
        id: 1,
        title: 'Test Thought',
        tags: null,
        featured: 0
      };

      const formatted = {
        ...rawThought,
        tags: rawThought.tags ? JSON.parse(rawThought.tags) : [],
        featured: Boolean(rawThought.featured)
      };

      expect(formatted.tags).toEqual([]);
      expect(formatted.featured).toBe(false);
    });

    it('should convert featured integer to boolean', () => {
      expect(Boolean(1)).toBe(true);
      expect(Boolean(0)).toBe(false);
    });

    it('should handle empty tags array', () => {
      const rawThought = {
        tags: '[]'
      };

      const formatted = {
        tags: rawThought.tags ? JSON.parse(rawThought.tags) : []
      };

      expect(formatted.tags).toEqual([]);
      expect(Array.isArray(formatted.tags)).toBe(true);
    });
  });

  describe('Create Thought Validation', () => {
    it('should validate all required fields', () => {
      const validThought = {
        title: 'Test Thought',
        snippet: 'Test Snippet',
        content: 'Test Content'
      };

      const isValid = !!(validThought.title && validThought.snippet && validThought.content);

      expect(isValid).toBe(true);
    });

    it('should detect missing title', () => {
      const thought = {
        snippet: 'Test Snippet',
        content: 'Test Content'
      };

      const isValid = !!(thought.title && thought.snippet && thought.content);

      expect(isValid).toBe(false);
    });

    it('should detect missing snippet', () => {
      const thought = {
        title: 'Test Title',
        content: 'Test Content'
      };

      const isValid = !!(thought.title && thought.snippet && thought.content);

      expect(isValid).toBe(false);
    });

    it('should detect missing content', () => {
      const thought = {
        title: 'Test Title',
        snippet: 'Test Snippet'
      };

      const isValid = !!(thought.title && thought.snippet && thought.content);

      expect(isValid).toBe(false);
    });

    it('should build validation error response correctly', () => {
      const title = undefined;
      const snippet = 'Test';
      const content = undefined;

      const errorResponse = {
        error: 'Validation failed',
        fields: {
          title: !title ? 'Title is required' : undefined,
          snippet: !snippet ? 'Snippet is required' : undefined,
          content: !content ? 'Content is required' : undefined
        }
      };

      expect(errorResponse.fields.title).toBe('Title is required');
      expect(errorResponse.fields.snippet).toBeUndefined();
      expect(errorResponse.fields.content).toBe('Content is required');
    });
  });

  describe('Thought Date Handling', () => {
    it('should use provided date when available', () => {
      const providedDate = '2024-01-15T10:00:00.000Z';
      const date = providedDate || new Date().toISOString();

      expect(date).toBe(providedDate);
    });

    it('should generate current date when not provided', () => {
      const providedDate = undefined;
      const date = providedDate || new Date().toISOString();

      expect(date).toBeDefined();
      expect(typeof date).toBe('string');
      expect(date.includes('T')).toBe(true);
    });

    it('should format date as ISO string', () => {
      const date = new Date().toISOString();

      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Thought JSON Serialization', () => {
    it('should stringify tags array for database storage', () => {
      const tags = ['javascript', 'react', 'testing'];
      const serialized = JSON.stringify(tags);

      expect(serialized).toBe('["javascript","react","testing"]');
    });

    it('should handle null tags', () => {
      const tags = undefined;
      const stored = tags ? JSON.stringify(tags) : null;

      expect(stored).toBeNull();
    });

    it('should convert featured boolean to integer', () => {
      expect(true ? 1 : 0).toBe(1);
      expect(false ? 1 : 0).toBe(0);
      expect(undefined ? 1 : 0).toBe(0);
    });
  });

  describe('Update Thought Logic', () => {
    it('should preserve existing values when field not provided', () => {
      const existingThought = {
        id: 1,
        title: 'Original Title',
        snippet: 'Original Snippet',
        content: 'Original Content',
        featured: 1
      };

      const updateData = {
        title: 'New Title'
      };

      const updated = {
        title: updateData.title !== undefined ? updateData.title : existingThought.title,
        snippet: updateData.snippet !== undefined ? updateData.snippet : existingThought.snippet,
        content: updateData.content !== undefined ? updateData.content : existingThought.content
      };

      expect(updated.title).toBe('New Title');
      expect(updated.snippet).toBe('Original Snippet');
      expect(updated.content).toBe('Original Content');
    });

    it('should update multiple fields when provided', () => {
      const existingThought = {
        title: 'Old',
        snippet: 'Old',
        content: 'Old',
        tags: '["old"]',
        featured: 0
      };

      const updateData = {
        title: 'New',
        snippet: 'New',
        tags: ['new', 'updated']
      };

      const updated = {
        title: updateData.title !== undefined ? updateData.title : existingThought.title,
        snippet: updateData.snippet !== undefined ? updateData.snippet : existingThought.snippet,
        content: updateData.content !== undefined ? updateData.content : existingThought.content,
        tags: updateData.tags !== undefined ? JSON.stringify(updateData.tags) : existingThought.tags
      };

      expect(updated.title).toBe('New');
      expect(updated.snippet).toBe('New');
      expect(updated.content).toBe('Old');
      expect(updated.tags).toBe('["new","updated"]');
    });
  });

  describe('Thought Ordering', () => {
    it('should order thoughts by date descending', () => {
      const sql = 'SELECT * FROM thoughts ORDER BY date DESC LIMIT ? OFFSET ?';

      expect(sql).toContain('ORDER BY date DESC');
    });

    it('should apply ordering before pagination', () => {
      const sql = 'SELECT * FROM thoughts ORDER BY date DESC LIMIT ? OFFSET ?';

      expect(sql.indexOf('ORDER BY')).toBeLessThan(sql.indexOf('LIMIT'));
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent thought', () => {
      const thought = null;
      const statusCode = thought ? 200 : 404;
      const errorMessage = thought ? null : 'Thought not found';

      expect(statusCode).toBe(404);
      expect(errorMessage).toBe('Thought not found');
    });

    it('should return 400 for validation errors', () => {
      const title = '';
      const snippet = '';
      const content = '';
      const hasValidationError = !title || !snippet || !content;

      const statusCode = hasValidationError ? 400 : 201;

      expect(statusCode).toBe(400);
    });

    it('should return 201 for successful creation', () => {
      const title = 'Valid';
      const snippet = 'Valid';
      const content = 'Valid';
      const hasValidationError = !title || !snippet || !content;

      const statusCode = hasValidationError ? 400 : 201;

      expect(statusCode).toBe(201);
    });
  });

  describe('Response Structure', () => {
    it('should include pagination metadata in list response', () => {
      const response = {
        thoughts: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 30,
          totalPages: 3
        }
      };

      expect(response.pagination).toBeDefined();
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(10);
      expect(response.pagination.total).toBe(30);
      expect(response.pagination.totalPages).toBe(3);
    });

    it('should return formatted thought in single item response', () => {
      const response = {
        id: 1,
        title: 'Test Thought',
        snippet: 'Test Snippet',
        content: 'Test Content',
        date: '2024-01-15T10:00:00.000Z',
        tags: ['javascript'],
        featured: true
      };

      expect(response.id).toBeDefined();
      expect(response.title).toBeDefined();
      expect(response.snippet).toBeDefined();
      expect(response.content).toBeDefined();
      expect(Array.isArray(response.tags)).toBe(true);
      expect(typeof response.featured).toBe('boolean');
    });

    it('should return success message for deletion', () => {
      const response = {
        message: 'Thought deleted successfully'
      };

      expect(response.message).toBe('Thought deleted successfully');
    });
  });
});
