import { query, queryOne } from '../config/database.js';

/**
 * Get assignment details by ID
 * GET /api/assignments/:id
 */
export const getAssignmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get assignment with lesson and course information
    const assignmentSql = `
      SELECT 
        a.*,
        l.title as lesson_title,
        l.course_id,
        c.title as course_title
      FROM assignments a
      JOIN lessons l ON a.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE a.id = ?
    `;

    const assignment = queryOne(assignmentSql, [id]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, assignment.course_id]
    );

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to view assignments' });
    }

    // Get user's submission for this assignment if it exists
    const submission = queryOne(
      'SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [id, userId]
    );

    const formattedAssignment = {
      ...assignment,
      required: Boolean(assignment.required),
      my_submission: submission || null
    };

    res.json(formattedAssignment);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit assignment
 * POST /api/assignments/:id/submit
 */
export const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { github_repo_url, live_preview_url, notes, is_public = true } = req.body;

    // Get assignment and verify access
    const assignmentSql = `
      SELECT 
        a.*,
        l.course_id,
        c.title as course_title
      FROM assignments a
      JOIN lessons l ON a.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE a.id = ?
    `;

    const assignment = queryOne(assignmentSql, [id]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, assignment.course_id]
    );

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to submit assignments' });
    }

    // Get user's display name
    const user = queryOne('SELECT display_name FROM users WHERE id = ?', [userId]);

    // Check if submission already exists
    const existingSubmission = queryOne(
      'SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [id, userId]
    );

    if (existingSubmission) {
      return res.status(400).json({ 
        error: 'You have already submitted this assignment. Use PUT to update your submission.' 
      });
    }

    // Validate URLs if provided
    if (github_repo_url && !isValidUrl(github_repo_url)) {
      return res.status(400).json({ 
        error: 'Invalid GitHub repository URL' 
      });
    }

    if (live_preview_url && !isValidUrl(live_preview_url)) {
      return res.status(400).json({ 
        error: 'Invalid live preview URL' 
      });
    }

    // Create submission
    const submissionSql = `
      INSERT INTO submissions (
        assignment_id, 
        student_id, 
        student_name, 
        github_repo_url, 
        live_preview_url, 
        notes, 
        is_public
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = query(submissionSql, [
      id,
      userId,
      user.display_name,
      github_repo_url || null,
      live_preview_url || null,
      notes || null,
      is_public ? 1 : 0
    ]);

    // Get the created submission
    const newSubmission = queryOne('SELECT * FROM submissions WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: {
        ...newSubmission,
        is_public: Boolean(newSubmission.is_public)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update own submission
 * PUT /api/submissions/:id
 */
export const updateSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { github_repo_url, live_preview_url, notes, is_public } = req.body;

    // Get submission and verify ownership
    const submission = queryOne('SELECT * FROM submissions WHERE id = ?', [id]);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.student_id !== userId) {
      return res.status(403).json({ error: 'You can only update your own submissions' });
    }

    // Validate URLs if provided
    if (github_repo_url && !isValidUrl(github_repo_url)) {
      return res.status(400).json({ 
        error: 'Invalid GitHub repository URL' 
      });
    }

    if (live_preview_url && !isValidUrl(live_preview_url)) {
      return res.status(400).json({ 
        error: 'Invalid live preview URL' 
      });
    }

    // Update submission
    const updateSql = `
      UPDATE submissions SET
        github_repo_url = ?,
        live_preview_url = ?,
        notes = ?,
        is_public = ?
      WHERE id = ?
    `;

    query(updateSql, [
      github_repo_url !== undefined ? github_repo_url : submission.github_repo_url,
      live_preview_url !== undefined ? live_preview_url : submission.live_preview_url,
      notes !== undefined ? notes : submission.notes,
      is_public !== undefined ? (is_public ? 1 : 0) : submission.is_public,
      id
    ]);

    // Get updated submission
    const updatedSubmission = queryOne('SELECT * FROM submissions WHERE id = ?', [id]);

    res.json({
      message: 'Submission updated successfully',
      submission: {
        ...updatedSubmission,
        is_public: Boolean(updatedSubmission.is_public)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete own submission
 * DELETE /api/submissions/:id
 */
export const deleteSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get submission and verify ownership
    const submission = queryOne('SELECT * FROM submissions WHERE id = ?', [id]);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.student_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own submissions' });
    }

    // Delete submission (comments will be cascade deleted)
    query('DELETE FROM submissions WHERE id = ?', [id]);

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get public submissions for an assignment
 * GET /api/assignments/:id/submissions
 */
export const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get assignment and verify access
    const assignmentSql = `
      SELECT 
        a.*,
        l.course_id
      FROM assignments a
      JOIN lessons l ON a.lesson_id = l.id
      WHERE a.id = ?
    `;

    const assignment = queryOne(assignmentSql, [id]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, assignment.course_id]
    );

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to view submissions' });
    }

    // Get public submissions for this assignment
    const submissionsSql = `
      SELECT 
        s.*,
        CASE WHEN s.student_id = ? THEN 1 ELSE 0 END as is_mine
      FROM submissions s
      WHERE s.assignment_id = ? AND s.is_public = 1
      ORDER BY s.submitted_at DESC
    `;

    const result = query(submissionsSql, [userId, id]);
    const submissions = result.rows.map(submission => ({
      ...submission,
      is_public: Boolean(submission.is_public),
      is_mine: Boolean(submission.is_mine)
    }));

    res.json({
      assignment_id: id,
      assignment_title: assignment.title,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's submissions
 * GET /api/submissions/my-submissions
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all submissions by the current user with assignment and course info
    const submissionsSql = `
      SELECT 
        s.*,
        a.title as assignment_title,
        a.due_date,
        l.title as lesson_title,
        c.title as course_title,
        c.id as course_id
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      JOIN courses c ON l.course_id = c.id
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `;

    const result = query(submissionsSql, [userId]);
    const submissions = result.rows.map(submission => ({
      ...submission,
      is_public: Boolean(submission.is_public)
    }));

    res.json({ submissions });
  } catch (error) {
    next(error);
  }
};

/**
 * Add comment to submission
 * POST /api/submissions/:id/comments
 */
export const addSubmissionComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Get submission and verify it's public or user's own
    const submissionSql = `
      SELECT 
        s.*,
        a.lesson_id,
        l.course_id
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      WHERE s.id = ?
    `;

    const submission = queryOne(submissionSql, [id]);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if submission is public or belongs to the user
    if (!submission.is_public && submission.student_id !== userId) {
      return res.status(403).json({ error: 'Cannot comment on private submissions' });
    }

    // Check if user is enrolled in the course
    const enrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, submission.course_id]
    );

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to comment' });
    }

    // Get user's display name
    const user = queryOne('SELECT display_name FROM users WHERE id = ?', [userId]);

    // Add comment
    const commentSql = `
      INSERT INTO submission_comments (submission_id, user_id, user_name, content)
      VALUES (?, ?, ?, ?)
    `;

    const result = query(commentSql, [id, userId, user.display_name, content.trim()]);

    // Get the created comment
    const newComment = queryOne('SELECT * FROM submission_comments WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments for a submission
 * GET /api/submissions/:id/comments
 */
export const getSubmissionComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get submission and verify access
    const submissionSql = `
      SELECT 
        s.*,
        a.lesson_id,
        l.course_id
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN lessons l ON a.lesson_id = l.id
      WHERE s.id = ?
    `;

    const submission = queryOne(submissionSql, [id]);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if submission is public or belongs to the user
    if (!submission.is_public && submission.student_id !== userId) {
      return res.status(403).json({ error: 'Cannot view comments on private submissions' });
    }

    // Check if user is enrolled in the course
    const enrollment = queryOne(
      'SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, submission.course_id]
    );

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to view comments' });
    }

    // Get comments for this submission
    const commentsSql = `
      SELECT * FROM submission_comments
      WHERE submission_id = ?
      ORDER BY created_at ASC
    `;

    const result = query(commentsSql, [id]);
    const comments = result.rows;

    res.json({
      submission_id: id,
      comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to validate URLs
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}