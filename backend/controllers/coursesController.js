import { query, queryOne } from '../config/database.js';

/**
 * Get all courses for authenticated users
 * GET /api/courses
 */
export const getCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all courses with instructor information and enrollment status
    const sql = `
      SELECT 
        c.*,
        u.display_name as instructor_name,
        CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END as is_enrolled
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
      ORDER BY c.created_at DESC
    `;

    const result = query(sql, [userId]);
    const courses = result.rows.map(course => ({
      ...course,
      is_enrolled: Boolean(course.is_enrolled)
    }));

    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single course with lessons and assignments
 * GET /api/courses/:id
 */
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get course with instructor information
    const courseSql = `
      SELECT 
        c.*,
        u.display_name as instructor_name,
        CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END as is_enrolled
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id AND e.user_id = ?
      WHERE c.id = ?
    `;

    const course = queryOne(courseSql, [userId, id]);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is enrolled
    if (!course.is_enrolled) {
      return res.status(403).json({ error: 'You must be enrolled in this course to view its content' });
    }

    // Get lessons for the course
    const lessonsSql = `
      SELECT * FROM lessons 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `;

    const lessonsResult = query(lessonsSql, [id]);
    const lessons = lessonsResult.rows;

    // Get assignments for each lesson
    for (const lesson of lessons) {
      const assignmentsSql = `
        SELECT * FROM assignments 
        WHERE lesson_id = ? 
        ORDER BY created_at ASC
      `;
      const assignmentsResult = query(assignmentsSql, [lesson.id]);
      lesson.assignments = assignmentsResult.rows.map(assignment => ({
        ...assignment,
        required: Boolean(assignment.required)
      }));
    }

    // Get user's progress
    const enrollment = queryOne(
      'SELECT completed_lessons FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );

    const completedLessons = enrollment?.completed_lessons 
      ? JSON.parse(enrollment.completed_lessons) 
      : [];

    const formattedCourse = {
      ...course,
      is_enrolled: Boolean(course.is_enrolled),
      lessons,
      progress: {
        completed_lessons: completedLessons,
        total_lessons: lessons.length,
        completion_percentage: lessons.length > 0 
          ? Math.round((completedLessons.length / lessons.length) * 100) 
          : 0
      }
    };

    res.json(formattedCourse);
  } catch (error) {
    next(error);
  }
};

/**
 * Enroll student in course
 * POST /api/courses/:id/enroll
 */
export const enrollInCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if course exists
    const course = queryOne('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollmentSql = `
      INSERT INTO enrollments (user_id, course_id, completed_lessons)
      VALUES (?, ?, '[]')
    `;

    query(enrollmentSql, [userId, id]);

    res.status(201).json({ 
      message: 'Successfully enrolled in course',
      course_id: id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student progress for a course
 * GET /api/courses/:id/progress
 */
export const getCourseProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if enrolled
    const enrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, id]
    );

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    // Get total lessons count
    const totalLessonsResult = queryOne(
      'SELECT COUNT(*) as total FROM lessons WHERE course_id = ?',
      [id]
    );

    const completedLessons = enrollment.completed_lessons 
      ? JSON.parse(enrollment.completed_lessons) 
      : [];

    const totalLessons = totalLessonsResult.total;
    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons.length / totalLessons) * 100) 
      : 0;

    res.json({
      course_id: id,
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      completion_percentage: completionPercentage,
      enrolled_at: enrollment.enrolled_at,
      last_accessed_at: enrollment.last_accessed_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark lesson as complete
 * PUT /api/lessons/:id/complete
 */
export const markLessonComplete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if lesson exists and get course_id
    const lesson = queryOne('SELECT * FROM lessons WHERE id = ?', [id]);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, lesson.course_id]
    );

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    // Get current completed lessons
    const completedLessons = enrollment.completed_lessons 
      ? JSON.parse(enrollment.completed_lessons) 
      : [];

    // Add lesson to completed if not already there
    if (!completedLessons.includes(id)) {
      completedLessons.push(id);

      // Update enrollment
      const updateSql = `
        UPDATE enrollments 
        SET completed_lessons = ?, last_accessed_at = datetime('now')
        WHERE user_id = ? AND course_id = ?
      `;

      query(updateSql, [JSON.stringify(completedLessons), userId, lesson.course_id]);
    }

    res.json({ 
      message: 'Lesson marked as complete',
      lesson_id: id,
      completed_lessons: completedLessons
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new course (admin/instructor only)
 * POST /api/courses
 */
export const createCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const instructorId = req.user.id;

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
      INSERT INTO courses (title, description, instructor_id)
      VALUES (?, ?, ?)
    `;

    const result = query(sql, [title, description, instructorId]);
    const newCourse = queryOne('SELECT * FROM courses WHERE id = ?', [result.lastID]);

    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};

/**
 * Update course (admin/instructor only)
 * PUT /api/courses/:id
 */
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const existingCourse = queryOne('SELECT * FROM courses WHERE id = ?', [id]);
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the instructor or admin
    if (existingCourse.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this course' });
    }

    const sql = `
      UPDATE courses SET
        title = ?,
        description = ?
      WHERE id = ?
    `;

    const params = [
      title !== undefined ? title : existingCourse.title,
      description !== undefined ? description : existingCourse.description,
      id
    ];

    query(sql, params);
    const updatedCourse = queryOne('SELECT * FROM courses WHERE id = ?', [id]);

    res.json(updatedCourse);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course (admin/instructor only)
 * DELETE /api/courses/:id
 */
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if course exists
    const existingCourse = queryOne('SELECT * FROM courses WHERE id = ?', [id]);
    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is the instructor or admin
    if (existingCourse.instructor_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this course' });
    }

    query('DELETE FROM courses WHERE id = ?', [id]);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};