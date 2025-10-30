import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AssignmentSubmissionForm from '../components/AssignmentSubmissionForm';
import SubmissionsList from '../components/SubmissionsList';
import SkeletonLoader from '../components/SkeletonLoader';
import { learnAPI, handleDjangoError } from '../utils/djangoApi';

const ProjectsRepo = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [publicSubmissions, setPublicSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all assignments and user's submissions
  const fetchAssignmentsAndSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's enrollments to find courses
      const enrollmentsResponse = await learnAPI.getEnrollments();
      const enrollments = enrollmentsResponse?.data?.results || enrollmentsResponse?.data || [];
      
      // Fetch assignments from all enrolled courses
      const allAssignments = [];
      for (const enrollment of enrollments) {
        try {
          // Get course details to get lessons
          const courseResponse = await learnAPI.getCourse(enrollment.course);
          const course = courseResponse?.data;
          
          if (!course) {continue;}
          
          // Get lessons for this course
          const lessonsResponse = await learnAPI.getLessons(course.id);
          const lessons = lessonsResponse?.data?.results || lessonsResponse?.data || [];
          
          // Get assignments for each lesson in the course
          for (const lesson of lessons) {
            try {
              const assignmentsResponse = await learnAPI.getAssignments(lesson.id);
              const lessonAssignments = assignmentsResponse?.data?.results || assignmentsResponse?.data || [];
              
              // Add course and lesson info to assignments
              if (Array.isArray(lessonAssignments)) {
                lessonAssignments.forEach(assignment => {
                  assignment.course_title = course.title;
                  assignment.lesson_title = lesson.title;
                });
                
                allAssignments.push(...lessonAssignments);
              }
            } catch (lessonErr) {
              console.error(`Error fetching assignments for lesson ${lesson.id}:`, lessonErr);
            }
          }
        } catch (courseErr) {
          console.error(`Error fetching course ${enrollment.course}:`, courseErr);
        }
      }
      
      setAssignments(allAssignments);

      // Fetch user's submissions
      try {
        const submissionsResponse = await learnAPI.getSubmissions();
        const submissionsData = submissionsResponse?.data?.results || submissionsResponse?.data || [];
        setMySubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      } catch (submissionsErr) {
        console.error('Error fetching submissions:', submissionsErr);
        setMySubmissions([]);
      }

    } catch (err) {
      console.error('Error fetching assignments and submissions:', err);
      const djangoError = handleDjangoError(err);
      setError(djangoError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch public submissions for a specific assignment
  const fetchPublicSubmissions = useCallback(async (assignmentId) => {
    try {
      const response = await learnAPI.getSubmissions(assignmentId);
      const submissions = response?.data?.results || response?.data || [];
      setPublicSubmissions(prev => ({
        ...prev,
        [assignmentId]: Array.isArray(submissions) ? submissions : []
      }));
    } catch (err) {
      console.error('Error fetching public submissions:', err);
      setPublicSubmissions(prev => ({
        ...prev,
        [assignmentId]: []
      }));
    }
  }, []);

  // Handle submission form success
  const handleSubmissionSuccess = useCallback((submission) => {
    // Update my submissions list
    setMySubmissions(prev => {
      const existingIndex = prev.findIndex(s => s.id === submission.id);
      if (existingIndex >= 0) {
        // Update existing submission
        const updated = [...prev];
        updated[existingIndex] = submission;
        return updated;
      } else {
        // Add new submission
        return [...prev, submission];
      }
    });

    // Close form
    setShowSubmissionForm(false);
    setEditingSubmission(null);
    setSelectedAssignment(null);

    // Refresh public submissions if viewing them
    if (viewingSubmissions) {
      fetchPublicSubmissions(viewingSubmissions.id);
    }
  }, [viewingSubmissions, fetchPublicSubmissions]);

  // Handle submit assignment
  const handleSubmitAssignment = useCallback((assignment) => {
    setSelectedAssignment(assignment);
    setEditingSubmission(null);
    setShowSubmissionForm(true);
  }, []);

  // Handle edit submission
  const handleEditSubmission = useCallback((assignment, submission) => {
    setSelectedAssignment(assignment);
    setEditingSubmission(submission);
    setShowSubmissionForm(true);
  }, []);

  // Handle view submissions
  const handleViewSubmissions = useCallback((assignment) => {
    setViewingSubmissions(assignment);
    fetchPublicSubmissions(assignment.id);
  }, [fetchPublicSubmissions]);

  // Get submission for assignment
  const getSubmissionForAssignment = useCallback((assignmentId) => {
    return mySubmissions.find(sub => sub.assignment === assignmentId);
  }, [mySubmissions]);

  // Check if assignment is overdue
  const isOverdue = useCallback((dueDate) => {
    if (!dueDate) {return false;}
    return new Date(dueDate) < new Date();
  }, []);

  useEffect(() => {
    fetchAssignmentsAndSubmissions();
  }, [fetchAssignmentsAndSubmissions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">📂 Student Project Repository</h1>
            <p className="text-gray-300">Loading your assignments...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonLoader key={index} variant="card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">📂 Student Project Repository</h1>
          </div>
          <div className="bg-red-900 border border-red-700 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-100">Error Loading Assignments</h3>
                <p className="text-red-200 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchAssignmentsAndSubmissions}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show submission form
  if (showSubmissionForm && selectedAssignment) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => {
                setShowSubmissionForm(false);
                setSelectedAssignment(null);
                setEditingSubmission(null);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center"
            >
              ← Back to Assignments
            </button>
          </div>
          
          <AssignmentSubmissionForm
            assignment={selectedAssignment}
            existingSubmission={editingSubmission}
            onSubmit={handleSubmissionSuccess}
            onCancel={() => {
              setShowSubmissionForm(false);
              setSelectedAssignment(null);
              setEditingSubmission(null);
            }}
          />
        </div>
      </div>
    );
  }

  // Show submissions list
  if (viewingSubmissions) {
    const submissions = publicSubmissions[viewingSubmissions.id] || [];
    
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => setViewingSubmissions(null)}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm flex items-center mb-4"
            >
              ← Back to Assignments
            </button>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">{viewingSubmissions.title}</h2>
              <p className="text-gray-300 mb-4">{viewingSubmissions.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="capitalize bg-gray-700 px-2 py-1 rounded">
                  {viewingSubmissions.type}
                </span>
                {viewingSubmissions.due_date && (
                  <span>
                    Due: {new Date(viewingSubmissions.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <SubmissionsList
            assignmentId={viewingSubmissions.id}
            submissions={submissions}
            currentUserId={user?.id}
            refreshSubmissions={() => fetchPublicSubmissions(viewingSubmissions.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">📂 Student Project Repository</h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Track your assignments, submit your work, and see what other students are building. 
            Complete assignments from your enrolled courses and share your progress with the community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-indigo-400 mb-2">
              {assignments.length}
            </div>
            <div className="text-gray-300">Total Assignments</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {mySubmissions.length}
            </div>
            <div className="text-gray-300">Submitted</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {assignments.length - mySubmissions.length}
            </div>
            <div className="text-gray-300">Pending</div>
          </div>
        </div>

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-100 mb-2">No Assignments Yet</h3>
            <p className="text-gray-400 mb-4">
              Enroll in courses to see assignments here. Visit the Learn page to browse available courses.
            </p>
            <button
              onClick={() => window.location.href = '/learn'}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => {
              const submission = getSubmissionForAssignment(assignment.id);
              const overdue = isOverdue(assignment.due_date);
              
              return (
                <div
                  key={assignment.id}
                  className={`bg-gray-800 rounded-lg border-2 transition-colors ${
                    submission ? 'border-green-600' : overdue ? 'border-red-600' : 'border-gray-700'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {assignment.title}
                          </h3>
                          
                          {/* Status Badge */}
                          {submission ? (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Submitted
                            </span>
                          ) : overdue ? (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Overdue
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-300 mb-4">{assignment.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                          <span className="capitalize bg-gray-700 px-2 py-1 rounded">
                            {assignment.type}
                          </span>
                          <span>Course: {assignment.course_title}</span>
                          {assignment.due_date && (
                            <span className={overdue ? 'text-red-400' : ''}>
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                          )}
                          {assignment.required && (
                            <span className="text-red-400 font-medium">Required</span>
                          )}
                        </div>

                        {/* Submission Info */}
                        {submission && (
                          <div className="bg-gray-700 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-green-400">Your Submission</span>
                              <span className="text-xs text-gray-400">
                                {submission.updated_at !== submission.submitted_at ? 'Updated' : 'Submitted'} {' '}
                                {new Date(submission.updated_at || submission.submitted_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-2">
                              {submission.github_repo_url && (
                                <a
                                  href={submission.github_repo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                  GitHub
                                </a>
                              )}
                              {submission.live_preview_url && (
                                <a
                                  href={submission.live_preview_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Live Preview
                                </a>
                              )}
                            </div>
                            
                            {submission.notes && (
                              <p className="text-gray-300 text-sm">{submission.notes}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {submission ? (
                        <button
                          onClick={() => handleEditSubmission(assignment, submission)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 font-medium"
                        >
                          Edit Submission
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubmitAssignment(assignment)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium"
                        >
                          Submit Assignment
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleViewSubmissions(assignment)}
                        className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
                      >
                        View All Submissions
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsRepo;
