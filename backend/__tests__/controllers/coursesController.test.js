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
  getCourses,
  getCourseById,
  enrollInCourse,
  getCourseProgress,
  markLessonComplete,
  createCourse,
  updateCourse,
  deleteCourse
} = await import('../../controllers/coursesController.js');

describe('Courses Controller - Learn Platform Logic', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 'user123', role: 'student', display_name: 'Test User' }
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  describe('Course Enrollment Logic', () => {
    describe('enrollInCourse', () => {
      it('should successfully enroll user in course', async () => {
        req.params.id = 'course123';
        
        const mockCourse = {
          id: 'course123',
          title: 'React Fundamentals',
          description: 'Learn React basics'
        };

        const mockResult = { lastID: 'enrollment123' };

        mockQueryOne
          .mockReturnValueOnce(mockCourse) // course exists check
          .mockReturnValueOnce(null); // no existing enrollment

        mockQuery.mockReturnValueOnce(mockResult);

        await enrollInCourse(req, res, next);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO enrollments'),
          ['user123', 'course123']
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Successfully enrolled in course',
          course_id: 'course123'
        });
      });

      it('should return 404 if course does not exist', async () => {
        req.params.id = 'nonexistent';
        mockQueryOne.mockReturnValueOnce(null);

        await enrollInCourse(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
      });

      it('should return 400 if user already enrolled', async () => {
        req.params.id = 'course123';
        
        const mockCourse = { id: 'course123' };
        const mockExistingEnrollment = { id: 'enrollment123' };

        mockQueryOne
          .mockReturnValueOnce(mockCourse) // course exists
          .mockReturnValueOnce(mockExistingEnrollment); // existing enrollment

        await enrollInCourse(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Already enrolled in this course' });
      });

      it('should create enrollment with empty completed lessons array', async () => {
        req.params.id = 'course123';
        
        const mockCourse = { id: 'course123' };
        const mockResult = { lastID: 'enrollment123' };

        mockQueryOne
          .mockReturnValueOnce(mockCourse)
          .mockReturnValueOnce(null);

        mockQuery.mockReturnValueOnce(mockResult);

        await enrollInCourse(req, res, next);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO enrollments'),
          ['user123', 'course123']
        );
      });
    });

    describe('getCourses', () => {
      it('should return courses with enrollment status', async () => {
        const mockCourses = [
          {
            id: 'course1',
            title: 'React Fundamentals',
            instructor_name: 'John Doe',
            is_enrolled: 1
          },
          {
            id: 'course2',
            title: 'Vue Basics',
            instructor_name: 'Jane Smith',
            is_enrolled: 0
          }
        ];

        mockQuery.mockReturnValueOnce({ rows: mockCourses });

        await getCourses(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
          courses: [
            {
              id: 'course1',
              title: 'React Fundamentals',
              instructor_name: 'John Doe',
              is_enrolled: true
            },
            {
              id: 'course2',
              title: 'Vue Basics',
              instructor_name: 'Jane Smith',
              is_enrolled: false
            }
          ]
        });
      });
    });

    describe('getCourseById', () => {
      it('should return course details for enrolled user', async () => {
        req.params.id = 'course123';
        
        const mockCourse = {
          id: 'course123',
          title: 'React Fundamentals',
          instructor_name: 'John Doe',
          is_enrolled: 1
        };

        const mockLessons = [
          {
            id: 'lesson1',
            title: 'Introduction',
            order_index: 1
          }
        ];

        const mockAssignments = [
          {
            id: 'assignment1',
            title: 'Hello World',
            required: 1
          }
        ];

        const mockEnrollment = {
          completed_lessons: '["lesson1"]'
        };

        mockQueryOne
          .mockReturnValueOnce(mockCourse) // course query
          .mockReturnValueOnce(mockEnrollment); // enrollment query

        mockQuery
          .mockReturnValueOnce({ rows: mockLessons }) // lessons query
          .mockReturnValueOnce({ rows: mockAssignments }); // assignments query

        await getCourseById(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
          ...mockCourse,
          is_enrolled: true,
          lessons: [
            {
              ...mockLessons[0],
              assignments: [
                {
                  ...mockAssignments[0],
                  required: true
                }
              ]
            }
          ],
          progress: {
            completed_lessons: ['lesson1'],
            total_lessons: 1,
            completion_percentage: 100
          }
        });
      });

      it('should return 403 if user not enrolled', async () => {
        req.params.id = 'course123';
        
        const mockCourse = {
          id: 'course123',
          is_enrolled: 0
        };

        mockQueryOne.mockReturnValueOnce(mockCourse);

        await getCourseById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ 
          error: 'You must be enrolled in this course to view its content' 
        });
      });

      it('should return 404 if course not found', async () => {
        req.params.id = 'nonexistent';
        mockQueryOne.mockReturnValueOnce(null);

        await getCourseById(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
      });
    });
  });

  describe('Lesson Completion Tracking', () => {
    describe('markLessonComplete', () => {
      it('should successfully mark lesson as complete', async () => {
        req.params.id = 'lesson123';
        
        const mockLesson = {
          id: 'lesson123',
          course_id: 'course123',
          title: 'Introduction to React'
        };

        const mockEnrollment = {
          completed_lessons: '["lesson1"]'
        };

        mockQueryOne
          .mockReturnValueOnce(mockLesson) // lesson exists check
          .mockReturnValueOnce(mockEnrollment); // enrollment check

        mockQuery.mockReturnValueOnce({}); // update query

        await markLessonComplete(req, res, next);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE enrollments'),
          ['["lesson1","lesson123"]', 'user123', 'course123']
        );
        expect(res.json).toHaveBeenCalledWith({
          message: 'Lesson marked as complete',
          lesson_id: 'lesson123',
          completed_lessons: ['lesson1', 'lesson123']
        });
      });

      it('should return 404 if lesson not found', async () => {
        req.params.id = 'nonexistent';
        mockQueryOne.mockReturnValueOnce(null);

        await markLessonComplete(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Lesson not found' });
      });

      it('should return 403 if user not enrolled in course', async () => {
        req.params.id = 'lesson123';
        
        const mockLesson = {
          id: 'lesson123',
          course_id: 'course123'
        };

        mockQueryOne
          .mockReturnValueOnce(mockLesson) // lesson exists
          .mockReturnValueOnce(null); // no enrollment

        await markLessonComplete(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not enrolled in this course' });
      });

      it('should not duplicate lesson in completed array', async () => {
        req.params.id = 'lesson123';
        
        const mockLesson = {
          id: 'lesson123',
          course_id: 'course123'
        };

        const mockEnrollment = {
          completed_lessons: '["lesson123"]' // already completed
        };

        mockQueryOne
          .mockReturnValueOnce(mockLesson)
          .mockReturnValueOnce(mockEnrollment);

        await markLessonComplete(req, res, next);

        // Should not call update since lesson already completed
        expect(mockQuery).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
          message: 'Lesson marked as complete',
          lesson_id: 'lesson123',
          completed_lessons: ['lesson123']
        });
      });

      it('should handle null completed lessons', async () => {
        req.params.id = 'lesson123';
        
        const mockLesson = {
          id: 'lesson123',
          course_id: 'course123'
        };

        const mockEnrollment = {
          completed_lessons: null
        };

        mockQueryOne
          .mockReturnValueOnce(mockLesson)
          .mockReturnValueOnce(mockEnrollment);

        mockQuery.mockReturnValueOnce({});

        await markLessonComplete(req, res, next);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE enrollments'),
          ['["lesson123"]', 'user123', 'course123']
        );
      });
    });

    describe('getCourseProgress', () => {
      it('should return progress for enrolled user', async () => {
        req.params.id = 'course123';
        
        const mockEnrollment = {
          completed_lessons: '["lesson1", "lesson2"]',
          enrolled_at: '2024-01-01T00:00:00Z',
          last_accessed_at: '2024-01-01T10:00:00Z'
        };

        const mockTotalLessons = { total: 5 };

        mockQueryOne
          .mockReturnValueOnce(mockEnrollment) // enrollment check
          .mockReturnValueOnce(mockTotalLessons); // total lessons count

        await getCourseProgress(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
          course_id: 'course123',
          completed_lessons: ['lesson1', 'lesson2'],
          total_lessons: 5,
          completion_percentage: 40,
          enrolled_at: '2024-01-01T00:00:00Z',
          last_accessed_at: '2024-01-01T10:00:00Z'
        });
      });

      it('should return 404 if user not enrolled', async () => {
        req.params.id = 'course123';
        mockQueryOne.mockReturnValueOnce(null);

        await getCourseProgress(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Not enrolled in this course' });
      });

      it('should handle null completed lessons', async () => {
        req.params.id = 'course123';
        
        const mockEnrollment = {
          completed_lessons: null,
          enrolled_at: '2024-01-01T00:00:00Z',
          last_accessed_at: '2024-01-01T10:00:00Z'
        };

        const mockTotalLessons = { total: 3 };

        mockQueryOne
          .mockReturnValueOnce(mockEnrollment)
          .mockReturnValueOnce(mockTotalLessons);

        await getCourseProgress(req, res, next);

        expect(res.json).toHaveBeenCalledWith({
          course_id: 'course123',
          completed_lessons: [],
          total_lessons: 3,
          completion_percentage: 0,
          enrolled_at: '2024-01-01T00:00:00Z',
          last_accessed_at: '2024-01-01T10:00:00Z'
        });
      });

      it('should calculate 100% completion correctly', async () => {
        req.params.id = 'course123';
        
        const mockEnrollment = {
          completed_lessons: '["lesson1", "lesson2", "lesson3"]',
          enrolled_at: '2024-01-01T00:00:00Z',
          last_accessed_at: '2024-01-01T10:00:00Z'
        };

        const mockTotalLessons = { total: 3 };

        mockQueryOne
          .mockReturnValueOnce(mockEnrollment)
          .mockReturnValueOnce(mockTotalLessons);

        await getCourseProgress(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            completion_percentage: 100
          })
        );
      });

      it('should handle zero total lessons', async () => {
        req.params.id = 'course123';
        
        const mockEnrollment = {
          completed_lessons: '[]',
          enrolled_at: '2024-01-01T00:00:00Z',
          last_accessed_at: '2024-01-01T10:00:00Z'
        };

        const mockTotalLessons = { total: 0 };

        mockQueryOne
          .mockReturnValueOnce(mockEnrollment)
          .mockReturnValueOnce(mockTotalLessons);

        await getCourseProgress(req, res, next);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            completion_percentage: 0
          })
        );
      });
    });
  });

  describe('Course Management', () => {
    describe('createCourse', () => {
      it('should create course successfully', async () => {
        req.body = {
          title: 'React Fundamentals',
          description: 'Learn React basics'
        };

        const mockResult = { lastID: 'course123' };
        const mockNewCourse = {
          id: 'course123',
          title: 'React Fundamentals',
          description: 'Learn React basics',
          instructor_id: 'user123'
        };

        mockQuery.mockReturnValueOnce(mockResult);
        mockQueryOne.mockReturnValueOnce(mockNewCourse);

        await createCourse(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockNewCourse);
      });

      it('should return 400 for missing required fields', async () => {
        req.body = {
          title: '',
          description: ''
        };

        await createCourse(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Validation failed',
          fields: {
            title: 'Title is required',
            description: 'Description is required'
          }
        });
      });
    });

    describe('updateCourse', () => {
      it('should update course successfully by instructor', async () => {
        req.params.id = 'course123';
        req.body = {
          title: 'Updated React Fundamentals',
          description: 'Updated description'
        };

        const mockExistingCourse = {
          id: 'course123',
          instructor_id: 'user123',
          title: 'React Fundamentals',
          description: 'Learn React basics'
        };

        const mockUpdatedCourse = {
          ...mockExistingCourse,
          title: 'Updated React Fundamentals',
          description: 'Updated description'
        };

        mockQueryOne
          .mockReturnValueOnce(mockExistingCourse) // existing course check
          .mockReturnValueOnce(mockUpdatedCourse); // updated course

        mockQuery.mockReturnValueOnce({});

        await updateCourse(req, res, next);

        expect(res.json).toHaveBeenCalledWith(mockUpdatedCourse);
      });

      it('should return 403 for unauthorized user', async () => {
        req.params.id = 'course123';
        req.body = { title: 'Updated Title' };
        req.user.id = 'other-user';

        const mockExistingCourse = {
          id: 'course123',
          instructor_id: 'instructor123'
        };

        mockQueryOne.mockReturnValueOnce(mockExistingCourse);

        await updateCourse(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ 
          error: 'Not authorized to update this course' 
        });
      });

      it('should allow admin to update any course', async () => {
        req.params.id = 'course123';
        req.body = { title: 'Admin Updated Title' };
        req.user = { id: 'admin123', role: 'admin' };

        const mockExistingCourse = {
          id: 'course123',
          instructor_id: 'instructor123',
          title: 'Original Title',
          description: 'Original Description'
        };

        const mockUpdatedCourse = {
          ...mockExistingCourse,
          title: 'Admin Updated Title'
        };

        mockQueryOne
          .mockReturnValueOnce(mockExistingCourse)
          .mockReturnValueOnce(mockUpdatedCourse);

        mockQuery.mockReturnValueOnce({});

        await updateCourse(req, res, next);

        expect(res.json).toHaveBeenCalledWith(mockUpdatedCourse);
      });
    });

    describe('deleteCourse', () => {
      it('should delete course successfully by instructor', async () => {
        req.params.id = 'course123';

        const mockExistingCourse = {
          id: 'course123',
          instructor_id: 'user123'
        };

        mockQueryOne.mockReturnValueOnce(mockExistingCourse);
        mockQuery.mockReturnValueOnce({});

        await deleteCourse(req, res, next);

        expect(mockQuery).toHaveBeenCalledWith('DELETE FROM courses WHERE id = ?', ['course123']);
        expect(res.json).toHaveBeenCalledWith({ message: 'Course deleted successfully' });
      });

      it('should return 404 if course not found', async () => {
        req.params.id = 'nonexistent';
        mockQueryOne.mockReturnValueOnce(null);

        await deleteCourse(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
      });

      it('should return 403 for unauthorized user', async () => {
        req.params.id = 'course123';
        req.user.id = 'other-user';

        const mockExistingCourse = {
          id: 'course123',
          instructor_id: 'instructor123'
        };

        mockQueryOne.mockReturnValueOnce(mockExistingCourse);

        await deleteCourse(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ 
          error: 'Not authorized to delete this course' 
        });
      });
    });
  });
});