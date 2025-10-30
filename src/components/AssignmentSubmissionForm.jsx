import { useState, useEffect, useCallback } from 'react';
import { learnAPI, handleDjangoError } from '../utils/djangoApi';

const AssignmentSubmissionForm = ({ 
  assignment, 
  existingSubmission = null, 
  onSubmit, 
  onCancel,
  isOpen = true 
}) => {
  const [formData, setFormData] = useState({
    githubRepoUrl: '',
    livePreviewUrl: '',
    notes: '',
    isPublic: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with existing submission data
  useEffect(() => {
    if (existingSubmission) {
      setFormData({
        githubRepoUrl: existingSubmission.github_repo_url || '',
        livePreviewUrl: existingSubmission.live_preview_url || '',
        notes: existingSubmission.notes || '',
        isPublic: existingSubmission.is_public || false
      });
    }
  }, [existingSubmission]);

  const validateUrl = (url, type) => {
    if (!url) {return null;} // URLs are optional
    
    try {
      const urlObj = new URL(url);
      
      if (type === 'github') {
        if (!urlObj.hostname.includes('github.com')) {
          return 'Please enter a valid GitHub repository URL';
        }
      }
      
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'URL must use http or https protocol';
      }
      
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validate GitHub URL if provided
    if (formData.githubRepoUrl) {
      const githubError = validateUrl(formData.githubRepoUrl, 'github');
      if (githubError) {
        newErrors.githubRepoUrl = githubError;
      }
    }
    
    // Validate live preview URL if provided
    if (formData.livePreviewUrl) {
      const previewError = validateUrl(formData.livePreviewUrl, 'preview');
      if (previewError) {
        newErrors.livePreviewUrl = previewError;
      }
    }
    
    // At least one URL should be provided
    if (!formData.githubRepoUrl && !formData.livePreviewUrl) {
      newErrors.general = 'Please provide at least a GitHub repository URL or live preview URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Clear general error when user provides a URL
    if ((name === 'githubRepoUrl' || name === 'livePreviewUrl') && value && errors.general) {
      setErrors(prev => ({
        ...prev,
        general: null
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setErrors({});
      
      const submissionData = {
        github_repo_url: formData.githubRepoUrl || null,
        live_preview_url: formData.livePreviewUrl || null,
        notes: formData.notes || null,
        is_public: formData.isPublic
      };
      
      let response;
      if (existingSubmission) {
        // Update existing submission - Django uses PATCH for updates
        response = await learnAPI.updateSubmission(existingSubmission.id, submissionData);
      } else {
        // Create new submission
        response = await learnAPI.submitAssignment(assignment.id, submissionData);
      }
      
      if (onSubmit) {
        onSubmit(response.data);
      }
      
      // Reset form if creating new submission
      if (!existingSubmission) {
        setFormData({
          githubRepoUrl: '',
          livePreviewUrl: '',
          notes: '',
          isPublic: false
        });
      }
      
    } catch (err) {
      console.error('Error submitting assignment:', err);
      const djangoError = handleDjangoError(err);
      
      if (djangoError.type === 'validation' && djangoError.errors) {
        // Handle field-specific validation errors from Django
        const fieldErrors = {};
        Object.keys(djangoError.errors).forEach(field => {
          // Map Django field names to form field names
          const fieldMap = {
            'github_repo_url': 'githubRepoUrl',
            'live_preview_url': 'livePreviewUrl',
            'notes': 'notes',
            'is_public': 'isPublic',
            'non_field_errors': 'general'
          };
          const formField = fieldMap[field] || field;
          fieldErrors[formField] = djangoError.errors[field];
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: djangoError.message });
      }
    } finally {
      setSubmitting(false);
    }
  }, [formData, validateForm, assignment, existingSubmission, onSubmit]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <h3 className="text-xl font-bold">
          {existingSubmission ? 'Edit Submission' : 'Submit Assignment'}
        </h3>
        <p className="text-indigo-100 mt-1">{assignment.title}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Assignment Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Assignment Instructions</h4>
          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {assignment.instructions || assignment.description}
          </p>
          {assignment.due_date && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Due Date:</span> {new Date(assignment.due_date).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        {/* GitHub Repository URL */}
        <div>
          <label htmlFor="githubRepoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="url"
            id="githubRepoUrl"
            name="githubRepoUrl"
            value={formData.githubRepoUrl}
            onChange={handleInputChange}
            placeholder="https://github.com/username/repository"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.githubRepoUrl ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.githubRepoUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.githubRepoUrl}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Link to your GitHub repository containing the project code
          </p>
        </div>

        {/* Live Preview URL */}
        <div>
          <label htmlFor="livePreviewUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Live Preview URL
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="url"
            id="livePreviewUrl"
            name="livePreviewUrl"
            value={formData.livePreviewUrl}
            onChange={handleInputChange}
            placeholder="https://your-project.netlify.app"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.livePreviewUrl ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.livePreviewUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.livePreviewUrl}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Link to the live, deployed version of your project
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes & Reflection
            <span className="text-gray-500 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Share your thoughts about this project, challenges you faced, what you learned, or any questions you have..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Reflect on your learning experience and share any insights
          </p>
        </div>

        {/* Make Public Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="isPublic" className="font-medium text-gray-700">
              Make submission public
            </label>
            <p className="text-gray-500">
              Allow other students to view your submission and provide feedback. 
              You can change this setting later.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {submitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {existingSubmission ? 'Updating...' : 'Submitting...'}
              </div>
            ) : (
              existingSubmission ? 'Update Submission' : 'Submit Assignment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentSubmissionForm;