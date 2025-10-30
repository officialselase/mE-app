import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { learnAPI, handleDjangoError } from '../utils/djangoApi';

const SubmissionsList = ({ assignmentId, submissions, currentUserId, onComment, refreshSubmissions }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [submittingComments, setSubmittingComments] = useState({});

  // Fetch comments for a submission
  const fetchComments = useCallback(async (submissionId) => {
    try {
      setLoadingComments(prev => ({ ...prev, [submissionId]: true }));
      const response = await learnAPI.getComments(submissionId);
      setComments(prev => ({
        ...prev,
        [submissionId]: response.data.results || response.data
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [submissionId]: false }));
    }
  }, []);

  // Submit a new comment
  const handleSubmitComment = useCallback(async (submissionId) => {
    const commentText = newComments[submissionId]?.trim();
    if (!commentText) {return;}

    try {
      setSubmittingComments(prev => ({ ...prev, [submissionId]: true }));
      
      const response = await learnAPI.addComment(submissionId, {
        content: commentText
      });
      
      // Add the new comment to the local state
      setComments(prev => ({
        ...prev,
        [submissionId]: [...(prev[submissionId] || []), response.data]
      }));
      
      // Clear the input
      setNewComments(prev => ({
        ...prev,
        [submissionId]: ''
      }));
      
      if (onComment) {
        onComment(submissionId, response.data);
      }
      
    } catch (err) {
      console.error('Error submitting comment:', err);
      const djangoError = handleDjangoError(err);
      // You might want to show an error message to the user
      console.error('Django error:', djangoError.message);
    } finally {
      setSubmittingComments(prev => ({ ...prev, [submissionId]: false }));
    }
  }, [newComments, onComment]);

  const handleCommentInputChange = useCallback((submissionId, value) => {
    setNewComments(prev => ({
      ...prev,
      [submissionId]: value
    }));
  }, []);

  // Load comments for all submissions when component mounts
  useEffect(() => {
    if (submissions && submissions.length > 0) {
      submissions.forEach(submission => {
        fetchComments(submission.id);
      });
    }
  }, [submissions, fetchComments]);

  if (!submissions || submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
        <p className="text-gray-600">
          Be the first to submit your work for this assignment! Other students' public submissions will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Student Submissions ({submissions.length})
        </h3>
        {refreshSubmissions && (
          <button
            onClick={refreshSubmissions}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => {
          const isCurrentUser = user && submission.student === user.id;
          const submissionComments = comments[submission.id] || [];
          const isLoadingComments = loadingComments[submission.id];
          const isSubmittingComment = submittingComments[submission.id];
          
          return (
            <div
              key={submission.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-colors ${
                isCurrentUser ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              {/* Submission Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">
                        {submission.student_name}
                      </h4>
                      {isCurrentUser && (
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Your Submission
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()} at{' '}
                      {new Date(submission.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {submission.updated_at !== submission.submitted_at && (
                      <span>Updated {new Date(submission.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Project Links */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {submission.github_repo_url && (
                    <a
                      href={submission.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View Code
                    </a>
                  )}
                  
                  {submission.live_preview_url && (
                    <a
                      href={submission.live_preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Live Preview
                    </a>
                  )}
                </div>

                {/* Notes */}
                {submission.notes && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Student Notes</h5>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {submission.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="p-6">
                <h5 className="font-medium text-gray-900 mb-4">
                  Comments ({submissionComments.length})
                </h5>

                {/* Existing Comments */}
                {isLoadingComments ? (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center text-gray-500">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Loading comments...
                    </div>
                  </div>
                ) : submissionComments.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {submissionComments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.user_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-4">No comments yet. Be the first to provide feedback!</p>
                )}

                {/* Add Comment Form */}
                <div className="border-t pt-4">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newComments[submission.id] || ''}
                        onChange={(e) => handleCommentInputChange(submission.id, e.target.value)}
                        placeholder="Add a comment or feedback..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => handleSubmitComment(submission.id)}
                      disabled={!newComments[submission.id]?.trim() || isSubmittingComment}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isSubmittingComment ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        'Comment'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubmissionsList;