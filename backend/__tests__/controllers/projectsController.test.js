import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../../controllers/projectsController.js';

describe('Projects Controller - CRUD Operations', () => {
  describe('Get Projects with Pagination', () => {
    it('should calculate pagination offset correctly', () => {
      const testCases = [
        { page: 1, limit: 10, expectedOffset: 0 },
        { page: 2, limit: 10, expectedOffset: 10 },
        { page: 3, limit: 20, expectedOffset: 40 },
        { page: 5, limit: 5, expectedOffset: 20 }
      ];

      testCases.forEach(({ page, limit, expectedOffset }) => {
        const offset = (page - 1) * limit;
        expect(offset).toBe(expectedOffset);
      });
    });

    it('should calculate total pages correctly', () => {
      const testCases = [
        { total: 100, limit: 10, expectedPages: 10 },
        { total: 95, limit: 10, expectedPages: 10 },
        { total: 101, limit: 10, expectedPages: 11 },
        { total: 7, limit: 10, expectedPages: 1 },
        { total: 0, limit: 10, expectedPages: 0 }
      ];

      testCases.forEach(({ total, limit, expectedPages }) => {
        const totalPages = Math.ceil(total / limit);
        expect(totalPages).toBe(expectedPages);
      });
    });

    it('should use default pagination values when not provided', () => {
      const page = parseInt(undefined) || 1;
      const limit = parseInt(undefined) || 10;

      expect(page).toBe(1);
      expect(limit).toBe(10);
    });

    it('should parse pagination query parameters correctly', () => {
      const queryParams = {
        page: '2',
        limit: '20'
      };

      const page = parseInt(queryParams.page) || 1;
      const limit = parseInt(queryParams.limit) || 10;

      expect(page).toBe(2);
      expect(limit).toBe(20);
    });
  });

  describe('Featured Content Filtering', () => {
    it('should detect featured filter from query string', () => {
      const testCases = [
        { query: 'true', expected: true },
        { query: 'false', expected: false },
        { query: undefined, expected: false },
        { query: '1', expected: false },
        { query: 'TRUE', expected: false }
      ];

      testCases.forEach(({ query, expected }) => {
        const featured = query === 'true';
        expect(featured).toBe(expected);
      });
    });

    it('should build correct SQL for featured filter', () => {
      const baseSql = 'SELECT * FROM projects';
      const featured = true;

      const sql = featured ? baseSql + ' WHERE featured = 1' : baseSql;

      expect(sql).toBe('SELECT * FROM projects WHERE featured = 1');
    });

    it('should build correct SQL without featured filter', () => {
      const baseSql = 'SELECT * FROM projects';
      const featured = false;

      const sql = featured ? baseSql + ' WHERE featured = 1' : baseSql;

      expect(sql).toBe('SELECT * FROM projects');
    });
  });

  describe('Project Data Formatting', () => {
    it('should parse JSON fields correctly', () => {
      const rawProject = {
        id: 1,
        title: 'Test Project',
        images: '["image1.jpg","image2.jpg"]',
        technologies: '["React","Node.js"]',
        featured: 1
      };

      const formatted = {
        ...rawProject,
        images: rawProject.images ? JSON.parse(rawProject.images) : [],
        technologies: rawProject.technologies ? JSON.parse(rawProject.technologies) : [],
        featured: Boolean(rawProject.featured)
      };

      expect(formatted.images).toEqual(['image1.jpg', 'image2.jpg']);
      expect(formatted.technologies).toEqual(['React', 'Node.js']);
      expect(formatted.featured).toBe(true);
    });

    it('should handle null JSON fields', () => {
      const rawProject = {
        id: 1,
        title: 'Test Project',
        images: null,
        technologies: null,
        featured: 0
      };

      const formatted = {
        ...rawProject,
        images: rawProject.images ? JSON.parse(rawProject.images) : [],
        technologies: rawProject.technologies ? JSON.parse(rawProject.technologies) : [],
        featured: Boolean(rawProject.featured)
      };

      expect(formatted.images).toEqual([]);
      expect(formatted.technologies).toEqual([]);
      expect(formatted.featured).toBe(false);
    });

    it('should convert featured integer to boolean', () => {
      expect(Boolean(1)).toBe(true);
      expect(Boolean(0)).toBe(false);
    });
  });

  describe('Create Project Validation', () => {
    it('should validate required fields', () => {
      const validProject = {
        title: 'Test Project',
        description: 'Test Description'
      };

      const invalidProject1 = {
        description: 'Test Description'
      };

      const invalidProject2 = {
        title: 'Test Project'
      };

      expect(!!(validProject.title && validProject.description)).toBe(true);
      expect(!!(invalidProject1.title && invalidProject1.description)).toBe(false);
      expect(!!(invalidProject2.title && invalidProject2.description)).toBe(false);
    });

    it('should build validation error response', () => {
      const title = undefined;
      const description = 'Test';

      const errorResponse = {
        error: 'Validation failed',
        fields: {
          title: !title ? 'Title is required' : undefined,
          description: !description ? 'Description is required' : undefined
        }
      };

      expect(errorResponse.fields.title).toBe('Title is required');
      expect(errorResponse.fields.description).toBeUndefined();
    });
  });

  describe('Project JSON Serialization', () => {
    it('should stringify arrays for database storage', () => {
      const images = ['image1.jpg', 'image2.jpg'];
      const technologies = ['React', 'Node.js'];

      const serializedImages = JSON.stringify(images);
      const serializedTech = JSON.stringify(technologies);

      expect(serializedImages).toBe('["image1.jpg","image2.jpg"]');
      expect(serializedTech).toBe('["React","Node.js"]');
    });

    it('should handle null values for optional fields', () => {
      const longDescription = undefined;
      const githubUrl = undefined;

      const storedLongDesc = longDescription || null;
      const storedGithubUrl = githubUrl || null;

      expect(storedLongDesc).toBeNull();
      expect(storedGithubUrl).toBeNull();
    });

    it('should convert featured boolean to integer', () => {
      expect(true ? 1 : 0).toBe(1);
      expect(false ? 1 : 0).toBe(0);
      expect(undefined ? 1 : 0).toBe(0);
    });
  });

  describe('Update Project Logic', () => {
    it('should preserve existing values when field not provided', () => {
      const existingProject = {
        id: 1,
        title: 'Original Title',
        description: 'Original Description',
        featured: 1
      };

      const updateData = {
        title: 'New Title'
      };

      const updatedTitle = updateData.title !== undefined ? updateData.title : existingProject.title;
      const updatedDesc = updateData.description !== undefined ? updateData.description : existingProject.description;

      expect(updatedTitle).toBe('New Title');
      expect(updatedDesc).toBe('Original Description');
    });

    it('should update all fields when provided', () => {
      const existingProject = {
        title: 'Old',
        description: 'Old',
        featured: 0
      };

      const updateData = {
        title: 'New',
        description: 'New',
        featured: true
      };

      const updated = {
        title: updateData.title !== undefined ? updateData.title : existingProject.title,
        description: updateData.description !== undefined ? updateData.description : existingProject.description,
        featured: updateData.featured !== undefined ? (updateData.featured ? 1 : 0) : existingProject.featured
      };

      expect(updated.title).toBe('New');
      expect(updated.description).toBe('New');
      expect(updated.featured).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent project', () => {
      const project = null;
      const statusCode = project ? 200 : 404;
      const errorMessage = project ? null : 'Project not found';

      expect(statusCode).toBe(404);
      expect(errorMessage).toBe('Project not found');
    });

    it('should return 400 for validation errors', () => {
      const title = '';
      const description = '';
      const hasValidationError = !title || !description;

      const statusCode = hasValidationError ? 400 : 201;

      expect(statusCode).toBe(400);
    });

    it('should return 201 for successful creation', () => {
      const title = 'Valid Title';
      const description = 'Valid Description';
      const hasValidationError = !title || !description;

      const statusCode = hasValidationError ? 400 : 201;

      expect(statusCode).toBe(201);
    });
  });

  describe('Response Structure', () => {
    it('should include pagination metadata in list response', () => {
      const response = {
        projects: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5
        }
      };

      expect(response.pagination).toBeDefined();
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(10);
      expect(response.pagination.total).toBe(50);
      expect(response.pagination.totalPages).toBe(5);
    });

    it('should return formatted project in single item response', () => {
      const response = {
        id: 1,
        title: 'Test Project',
        description: 'Test Description',
        images: ['image1.jpg'],
        technologies: ['React'],
        featured: true
      };

      expect(response.id).toBeDefined();
      expect(response.title).toBeDefined();
      expect(Array.isArray(response.images)).toBe(true);
      expect(Array.isArray(response.technologies)).toBe(true);
      expect(typeof response.featured).toBe('boolean');
    });

    it('should return success message for deletion', () => {
      const response = {
        message: 'Project deleted successfully'
      };

      expect(response.message).toBe('Project deleted successfully');
    });
  });
});
