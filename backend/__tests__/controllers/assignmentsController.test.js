import { jest } from '@jest/globals';

// Mock the database module before importing the controller
const mockQuery = jest.fn();
const mockQueryOne = jest.fn();

jest.unstable_mockModule('../../config/database.js', () => ({
  query: mockQuery,
  queryOne: mockQueryOne
}));

// Import the controller after mocking
const {
  getAssignmentById,
  submitAssignment,
  updateSubmission,
  deleteSubmission,
  getAssignmentSubmissions,
  getMySubmissions,
  addSubmissionComment,
  getSubmissionComments
} = await import('../../controllers/assignmentsController.js');

describe('Assignments Controller - Learn Platform Logic', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 'user123', display_name: 'Test User' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getAssignmentById', () => {
    it('should return assignment details for enrolled user', async () => {
      req.params.id = 'assignment123';
      
      const mockAssignment = {
        id: 'assignment123',
        title: 'Test Assignment',
        description: 'Test description',
        course_id: 'course123',
        required: 1
      };
      
      const mockSubmission = {
        id: 'submission123',
        assignment_id: 'assignment123',
        student_id: 'user123'
      };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment) // assignment query
        .mockReturnValueOnce({ id: 'enrollment123' }) // enrollment check
        .mockReturnValueOnce(mockSubmission); // user's submission

      await getAssignmentById(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        ...mockAssignment,
        required: true,
        my_submission: mockSubmission
      });
    });

    it('should return 404 if assignment not found', async () => {
      req.params.id = 'nonexistent';
      mockQueryOne.mockReturnValueOnce(null);

      await getAssignmentById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Assignment not found' });
    });

    it('should return 403 if user not enrolled', async () => {
      req.params.id = 'assignment123';
      
      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment) // assignment query
        .mockReturnValueOnce(null); // enrollment check

      await getAssignmentById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'You must be enrolled in this course to view assignments' 
      });
    });
  });

  describe('submitAssignment', () => {
    it('should create new submission successfully', async () => {
      req.params.id = 'assignment123';
      req.body = {
        github_repo_url: 'https://github.com/user/repo',
        live_preview_url: 'https://example.com',
        notes: 'Test notes',
        is_public: true
      };

      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };
      const mockResult = { lastID: 'submission123' };
      const mockSubmission = {
        id: 'submission123',
        assignment_id: 'assignment123',
        is_public: 1
      };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment) // assignment query
        .mockReturnValueOnce({ id: 'enrollment123' }) // enrollment check
        .mockReturnValueOnce(mockUser) // user query
        .mockReturnValueOnce(null) // existing submission check
        .mockReturnValueOnce(mockSubmission); // new submission

      mockQuery.mockReturnValueOnce(mockResult);

      await submitAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Assignment submitted successfully',
        submission: {
          ...mockSubmission,
          is_public: true
        }
      });
    });

    it('should return 400 if submission already exists', async () => {
      req.params.id = 'assignment123';
      req.body = {};

      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };
      const mockExistingSubmission = { id: 'existing123' };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment) // assignment query
        .mockReturnValueOnce({ id: 'enrollment123' }) // enrollment check
        .mockReturnValueOnce(mockUser) // user query
        .mockReturnValueOnce(mockExistingSubmission); // existing submission check

      await submitAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'You have already submitted this assignment. Use PUT to update your submission.' 
      });
    });

    it('should return 400 for invalid GitHub URL', async () => {
      req.params.id = 'assignment123';
      req.body = {
        github_repo_url: 'invalid-url'
      };

      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment) // assignment query
        .mockReturnValueOnce({ id: 'enrollment123' }) // enrollment check
        .mockReturnValueOnce(mockUser) // user query
        .mockReturnValueOnce(null); // existing submission check

      await submitAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid GitHub repository URL' 
      });
    });
  });

  describe('updateSubmission', () => {
    it('should update own submission successfully', async () => {
      req.params.id = 'submission123';
      req.body = {
        github_repo_url: 'https://github.com/user/updated-repo',
        notes: 'Updated notes'
      };

      const mockSubmission = {
        id: 'submission123',
        student_id: 'user123',
        github_repo_url: 'https://github.com/user/repo',
        live_preview_url: 'https://example.com',
        notes: 'Old notes',
        is_public: 1
      };

      const mockUpdatedSubmission = {
        ...mockSubmission,
        github_repo_url: 'https://github.com/user/updated-repo',
        notes: 'Updated notes'
      };

      mockQueryOne
        .mockReturnValueOnce(mockSubmission) // submission query
        .mockReturnValueOnce(mockUpdatedSubmission); // updated submission

      await updateSubmission(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Submission updated successfully',
        submission: {
          ...mockUpdatedSubmission,
          is_public: true
        }
      });
    });

    it('should return 403 if trying to update someone else\'s submission', async () => {
      req.params.id = 'submission123';
      req.body = {};

      const mockSubmission = {
        id: 'submission123',
        student_id: 'other-user'
      };

      mockQueryOne.mockReturnValueOnce(mockSubmission);

      await updateSubmission(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'You can only update your own submissions' 
      });
    });
  });

  describe('deleteSubmission', () => {
    it('should delete own submission successfully', async () => {
      req.params.id = 'submission123';

      const mockSubmission = {
        id: 'submission123',
        student_id: 'user123'
      };

      mockQueryOne.mockReturnValueOnce(mockSubmission);

      await deleteSubmission(req, res, next);

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM submissions WHERE id = ?', ['submission123']);
      expect(res.json).toHaveBeenCalledWith({ message: 'Submission deleted successfully' });
    });

    it('should return 403 if trying to delete someone else\'s submission', async () => {
      req.params.id = 'submission123';

      const mockSubmission = {
        id: 'submission123',
        student_id: 'other-user'
      };

      mockQueryOne.mockReturnValueOnce(mockSubmission);

      await deleteSubmission(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'You can only delete your own submissions' 
      });
    });
  });

  describe('getAssignmentSubmissions', () => {
    it('should return public submissions for enrolled user', async () => {
      req.params.id = 'assignment123';

      const mockAssignment = {
        id: 'assignment123',
        title: 'Test Assignment',
        course_id: 'course123'
      };

      const mockSubmissions = [
        {
          id: 'submission1',
          student_id: 'user123',
          is_public: 1,
          is_mine: 1
        },
        {
          id: 'submission2',
          student_id: 'other-user',
          is_public: 1,
          is_mine: 0
        }
      ];

      mockQueryOne
        .mockReturnValueOnce(mockAssignment) // assignment query
        .mockReturnValueOnce({ id: 'enrollment123' }); // enrollment check

      mockQuery.mockReturnValueOnce({ rows: mockSubmissions });

      await getAssignmentSubmissions(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        assignment_id: 'assignment123',
        assignment_title: 'Test Assignment',
        submissions: [
          {
            id: 'submission1',
            student_id: 'user123',
            is_public: true,
            is_mine: true
          },
          {
            id: 'submission2',
            student_id: 'other-user',
            is_public: true,
            is_mine: false
          }
        ]
      });
    });
  });

  describe('getMySubmissions', () => {
    it('should return current user\'s submissions', async () => {
      const mockSubmissions = [
        {
          id: 'submission1',
          assignment_title: 'Assignment 1',
          course_title: 'Course 1',
          is_public: 1
        },
        {
          id: 'submission2',
          assignment_title: 'Assignment 2',
          course_title: 'Course 2',
          is_public: 0
        }
      ];

      mockQuery.mockReturnValueOnce({ rows: mockSubmissions });

      await getMySubmissions(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        submissions: [
          {
            id: 'submission1',
            assignment_title: 'Assignment 1',
            course_title: 'Course 1',
            is_public: true
          },
          {
            id: 'submission2',
            assignment_title: 'Assignment 2',
            course_title: 'Course 2',
            is_public: false
          }
        ]
      });
    });
  });

  describe('addSubmissionComment', () => {
    it('should add comment to public submission successfully', async () => {
      req.params.id = 'submission123';
      req.body = { content: 'Great work!' };

      const mockSubmission = {
        id: 'submission123',
        student_id: 'other-user',
        is_public: 1,
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };
      const mockResult = { lastID: 'comment123' };
      const mockComment = {
        id: 'comment123',
        content: 'Great work!'
      };

      mockQueryOne
        .mockReturnValueOnce(mockSubmission) // submission query
        .mockReturnValueOnce({ id: 'enrollment123' }) // enrollment check
        .mockReturnValueOnce(mockUser) // user query
        .mockReturnValueOnce(mockComment); // new comment

      mockQuery.mockReturnValueOnce(mockResult);

      await addSubmissionComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comment added successfully',
        comment: mockComment
      });
    });

    it('should return 400 for empty comment', async () => {
      req.params.id = 'submission123';
      req.body = { content: '' };

      await addSubmissionComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Comment content is required' });
    });

    it('should return 403 for private submission from other user', async () => {
      req.params.id = 'submission123';
      req.body = { content: 'Great work!' };

      const mockSubmission = {
        id: 'submission123',
        student_id: 'other-user',
        is_public: 0
      };

      mockQueryOne.mockReturnValueOnce(mockSubmission);

      await addSubmissionComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Cannot comment on private submissions' 
      });
    });
  });

  describe('getSubmissionComments', () => {
    it('should return comments for public submission', async () => {
      req.params.id = 'submission123';

      const mockSubmission = {
        id: 'submission123',
        student_id: 'other-user',
        is_public: 1,
        course_id: 'course123'
      };

      const mockComments = [
        {
          id: 'comment1',
          content: 'Great work!',
          user_name: 'User 1'
        },
        {
          id: 'comment2',
          content: 'Nice solution!',
          user_name: 'User 2'
        }
      ];

      mockQueryOne
        .mockReturnValueOnce(mockSubmission) // submission query
        .mockReturnValueOnce({ id: 'enrollment123' }); // enrollment check

      mockQuery.mockReturnValueOnce({ rows: mockComments });

      await getSubmissionComments(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        submission_id: 'submission123',
        comments: mockComments
      });
    });

    it('should return 403 for private submission from other user', async () => {
      req.params.id = 'submission123';

      const mockSubmission = {
        id: 'submission123',
        student_id: 'other-user',
        is_public: 0
      };

      mockQueryOne.mockReturnValueOnce(mockSubmission);

      await getSubmissionComments(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Cannot view comments on private submissions' 
      });
    });

    it('should allow viewing comments on own private submission', async () => {
      req.params.id = 'submission123';

      const mockSubmission = {
        id: 'submission123',
        student_id: 'user123', // same as req.user.id
        is_public: 0,
        course_id: 'course123'
      };

      const mockComments = [
        {
          id: 'comment1',
          content: 'Self comment',
          user_name: 'Test User'
        }
      ];

      mockQueryOne
        .mockReturnValueOnce(mockSubmission) // submission query
        .mockReturnValueOnce({ id: 'enrollment123' }); // enrollment check

      mockQuery.mockReturnValueOnce({ rows: mockComments });

      await getSubmissionComments(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        submission_id: 'submission123',
        comments: mockComments
      });
    });
  });

  describe('Submission Visibility Logic', () => {
    describe('Public/Private Submission Visibility', () => {
      it('should only return public submissions in assignment submissions list', async () => {
        req.params.id = 'assignment123';

        const mockAssignment = {
          id: 'assignment123',
          title: 'Test Assignment',
          course_id: 'course123'
        };

        const mockSubmissions = [
          {
            id: 'submission1',
            student_id: 'user123',
            is_public: 1,
            is_mine: 1
          },
          {
            id: 'submission2',
            student_id: 'other-user',
            is_public: 1,
            is_mine: 0
          }
          // Private submissions should not appear in this list
        ];

        mockQueryOne
          .mockReturnValueOnce(mockAssignment)
          .mockReturnValueOnce({ id: 'enrollment123' });

        mockQuery.mockReturnValueOnce({ rows: mockSubmissions });

        await getAssignmentSubmissions(req, res, next);

        // Verify SQL query only selects public submissions
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('s.is_public = 1'),
          ['user123', 'assignment123']
        );

        expect(res.json).toHaveBeenCalledWith({
          assignment_id: 'assignment123',
          assignment_title: 'Test Assignment',
          submissions: [
            {
              id: 'submission1',
              student_id: 'user123',
              is_public: true,
              is_mine: true
            },
            {
              id: 'submission2',
              student_id: 'other-user',
              is_public: true,
              is_mine: false
            }
          ]
        });
      });

      it('should mark user\'s own submission correctly', async () => {
        req.params.id = 'assignment123';

        const mockAssignment = {
          id: 'assignment123',
          course_id: 'course123'
        };

        const mockSubmissions = [
          {
            id: 'submission1',
            student_id: 'user123',
            is_public: 1,
            is_mine: 1 // This should be true for current user
          },
          {
            id: 'submission2',
            student_id: 'other-user',
            is_public: 1,
            is_mine: 0 // This should be false for other users
          }
        ];

        mockQueryOne
          .mockReturnValueOnce(mockAssignment)
          .mockReturnValueOnce({ id: 'enrollment123' });

        mockQuery.mockReturnValueOnce({ rows: mockSubmissions });

        await getAssignmentSubmissions(req, res, next);

        const response = res.json.mock.calls[0][0];
        const userSubmission = response.submissions.find(s => s.student_id === 'user123');
        const otherSubmission = response.submissions.find(s => s.student_id === 'other-user');

        expect(userSubmission.is_mine).toBe(true);
        expect(otherSubmission.is_mine).toBe(false);
      });

      it('should allow commenting only on public submissions or own submissions', async () => {
        // Test commenting on public submission from other user
        req.params.id = 'submission123';
        req.body = { content: 'Great work!' };

        const mockPublicSubmission = {
          id: 'submission123',
          student_id: 'other-user',
          is_public: 1,
          course_id: 'course123'
        };

        const mockUser = { display_name: 'Test User' };
        const mockResult = { lastID: 'comment123' };
        const mockComment = {
          id: 'comment123',
          content: 'Great work!'
        };

        mockQueryOne
          .mockReturnValueOnce(mockPublicSubmission)
          .mockReturnValueOnce({ id: 'enrollment123' })
          .mockReturnValueOnce(mockUser)
          .mockReturnValueOnce(mockComment);

        mockQuery.mockReturnValueOnce(mockResult);

        await addSubmissionComment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Comment added successfully',
          comment: mockComment
        });
      });

      it('should prevent commenting on private submissions from other users', async () => {
        req.params.id = 'submission123';
        req.body = { content: 'Great work!' };

        const mockPrivateSubmission = {
          id: 'submission123',
          student_id: 'other-user',
          is_public: 0 // Private submission
        };

        mockQueryOne.mockReturnValueOnce(mockPrivateSubmission);

        await addSubmissionComment(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ 
          error: 'Cannot comment on private submissions' 
        });
      });
    });

    describe('Submission Privacy Controls', () => {
      it('should create private submission when is_public is false', async () => {
        req.params.id = 'assignment123';
        req.body = {
          github_repo_url: 'https://github.com/user/repo',
          notes: 'Private submission',
          is_public: false
        };

        const mockAssignment = {
          id: 'assignment123',
          course_id: 'course123'
        };

        const mockUser = { display_name: 'Test User' };
        const mockResult = { lastID: 'submission123' };
        const mockSubmission = {
          id: 'submission123',
          assignment_id: 'assignment123',
          is_public: 0 // Should be 0 for private
        };

        mockQueryOne
          .mockReturnValueOnce(mockAssignment)
          .mockReturnValueOnce({ id: 'enrollment123' })
          .mockReturnValueOnce(mockUser)
          .mockReturnValueOnce(null) // no existing submission
          .mockReturnValueOnce(mockSubmission);

        mockQuery.mockReturnValueOnce(mockResult);

        await submitAssignment(req, res, next);

        // Verify is_public is stored as 0 (false)
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO submissions'),
          expect.arrayContaining([0]) // is_public should be 0
        );

        expect(res.json).toHaveBeenCalledWith({
          message: 'Assignment submitted successfully',
          submission: {
            ...mockSubmission,
            is_public: false // Should be converted to boolean false
          }
        });
      });

      it('should update submission privacy setting', async () => {
        req.params.id = 'submission123';
        req.body = {
          is_public: false // Change from public to private
        };

        const mockSubmission = {
          id: 'submission123',
          student_id: 'user123',
          github_repo_url: 'https://github.com/user/repo',
          live_preview_url: 'https://example.com',
          notes: 'Test notes',
          is_public: 1 // Currently public
        };

        const mockUpdatedSubmission = {
          ...mockSubmission,
          is_public: 0 // Updated to private
        };

        mockQueryOne
          .mockReturnValueOnce(mockSubmission)
          .mockReturnValueOnce(mockUpdatedSubmission);

        await updateSubmission(req, res, next);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE submissions'),
          expect.arrayContaining([0, 'submission123']) // is_public should be 0
        );

        expect(res.json).toHaveBeenCalledWith({
          message: 'Submission updated successfully',
          submission: {
            ...mockUpdatedSubmission,
            is_public: false
          }
        });
      });
    });
  });

  describe('URL Validation', () => {
    it('should validate GitHub repository URLs', async () => {
      req.params.id = 'assignment123';
      req.body = {
        github_repo_url: 'invalid-url'
      };

      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment)
        .mockReturnValueOnce({ id: 'enrollment123' })
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null);

      await submitAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid GitHub repository URL' 
      });
    });

    it('should validate live preview URLs', async () => {
      req.params.id = 'assignment123';
      req.body = {
        live_preview_url: 'not-a-valid-url'
      };

      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment)
        .mockReturnValueOnce({ id: 'enrollment123' })
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null);

      await submitAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Invalid live preview URL' 
      });
    });

    it('should accept valid URLs', async () => {
      req.params.id = 'assignment123';
      req.body = {
        github_repo_url: 'https://github.com/user/valid-repo',
        live_preview_url: 'https://valid-preview.com'
      };

      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };
      const mockResult = { lastID: 'submission123' };
      const mockSubmission = {
        id: 'submission123',
        assignment_id: 'assignment123',
        is_public: 1
      };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment)
        .mockReturnValueOnce({ id: 'enrollment123' })
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockSubmission);

      mockQuery.mockReturnValueOnce(mockResult);

      await submitAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Assignment submitted successfully',
        submission: {
          ...mockSubmission,
          is_public: true
        }
      });
    });

    it('should allow null URLs', async () => {
      req.params.id = 'assignment123';
      req.body = {
        notes: 'Just notes, no URLs'
      };

      const mockAssignment = {
        id: 'assignment123',
        course_id: 'course123'
      };

      const mockUser = { display_name: 'Test User' };
      const mockResult = { lastID: 'submission123' };
      const mockSubmission = {
        id: 'submission123',
        assignment_id: 'assignment123',
        is_public: 1
      };

      mockQueryOne
        .mockReturnValueOnce(mockAssignment)
        .mockReturnValueOnce({ id: 'enrollment123' })
        .mockReturnValueOnce(mockUser)
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(mockSubmission);

      mockQuery.mockReturnValueOnce(mockResult);

      await submitAssignment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO submissions'),
        expect.arrayContaining([null, null]) // URLs should be null
      );
    });
  });
});