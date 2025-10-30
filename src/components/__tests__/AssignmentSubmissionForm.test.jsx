import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AssignmentSubmissionForm from '../AssignmentSubmissionForm';
import { learnAPI } from '../../utils/djangoApi';

// Mock the Django API client
vi.mock('../../utils/djangoApi', () => ({
  learnAPI: {
    submitAssignment: vi.fn(),
    updateSubmission: vi.fn(),
  },
}));

describe('AssignmentSubmissionForm', () => {
  const mockAssignment = {
    id: '1',
    title: 'Build a Todo App',
    description: 'Create a simple todo application using React',
    instructions: 'Follow the requirements and submit your GitHub repo and live preview',
    due_date: '2024-12-31',
  };

  const mockExistingSubmission = {
    id: '1',
    github_repo_url: 'https://github.com/user/todo-app',
    live_preview_url: 'https://todo-app.netlify.app',
    notes: 'This was challenging but fun!',
    is_public: true,
  };

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render form for new submission', () => {
      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Submit Assignment')).toBeInTheDocument();
      expect(screen.getByText('Build a Todo App')).toBeInTheDocument();
      expect(screen.getByText('Assignment Instructions')).toBeInTheDocument();
      expect(screen.getByText('Follow the requirements and submit your GitHub repo and live preview')).toBeInTheDocument();
      expect(screen.getByLabelText(/GitHub Repository URL/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Live Preview URL/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes & Reflection/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Make submission public/)).toBeInTheDocument();
      expect(screen.getByText('Submit Assignment')).toBeInTheDocument();
    });

    it('should render form for editing existing submission', () => {
      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          existingSubmission={mockExistingSubmission}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Edit Submission')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://github.com/user/todo-app')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://todo-app.netlify.app')).toBeInTheDocument();
      expect(screen.getByDisplayValue('This was challenging but fun!')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeChecked();
      expect(screen.getByText('Update Submission')).toBeInTheDocument();
    });

    it('should show due date when provided', () => {
      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.getByText(/Due Date: 12\/31\/2024/)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
          isOpen={false}
        />
      );

      expect(screen.queryByText('Submit Assignment')).not.toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should show error when no URLs are provided', async () => {
      const user = userEvent.setup();

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      expect(screen.getByText('Please provide at least a GitHub repository URL or live preview URL')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate GitHub URL format', async () => {
      const user = userEvent.setup();

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'https://example.com/repo');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      expect(screen.getByText('Please enter a valid GitHub repository URL')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate URL protocol', async () => {
      const user = userEvent.setup();

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const previewInput = screen.getByLabelText(/Live Preview URL/);
      await user.type(previewInput, 'ftp://example.com');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      expect(screen.getByText('URL must use http or https protocol')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate malformed URLs', async () => {
      const user = userEvent.setup();

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'not-a-url');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear field errors when user starts typing', async () => {
      const user = userEvent.setup();

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      // Trigger validation error
      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      expect(screen.getByText('Please provide at least a GitHub repository URL or live preview URL')).toBeInTheDocument();

      // Start typing in GitHub field
      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'https://github.com/user/repo');

      expect(screen.queryByText('Please provide at least a GitHub repository URL or live preview URL')).not.toBeInTheDocument();
    });
  });

  describe('Form submission', () => {
    it('should submit new assignment successfully', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        data: { 
          id: 1,
          assignment: 1,
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: 'Great learning experience!',
          is_public: true,
          submitted_at: '2024-01-15T10:30:00Z'
        } 
      };
      learnAPI.submitAssignment.mockResolvedValueOnce(mockResponse);

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      // Fill out form
      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      const previewInput = screen.getByLabelText(/Live Preview URL/);
      const notesInput = screen.getByLabelText(/Notes & Reflection/);
      const publicCheckbox = screen.getByLabelText(/Make submission public/);

      await user.type(githubInput, 'https://github.com/user/todo-app');
      await user.type(previewInput, 'https://todo-app.netlify.app');
      await user.type(notesInput, 'Great learning experience!');
      await user.click(publicCheckbox);

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      expect(screen.getByText('Submitting...')).toBeInTheDocument();

      await waitFor(() => {
        expect(learnAPI.submitAssignment).toHaveBeenCalledWith('1', {
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: 'Great learning experience!',
          is_public: true,
        });
        expect(mockOnSubmit).toHaveBeenCalledWith(mockResponse.data);
      });
    });

    it('should update existing submission successfully', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        data: { 
          id: 1,
          assignment: 1,
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: 'Updated notes',
          is_public: true,
          submitted_at: '2024-01-15T10:30:00Z'
        } 
      };
      learnAPI.updateSubmission.mockResolvedValueOnce(mockResponse);

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          existingSubmission={mockExistingSubmission}
          onSubmit={mockOnSubmit}
        />
      );

      // Modify existing data
      const notesInput = screen.getByDisplayValue('This was challenging but fun!');
      await user.clear(notesInput);
      await user.type(notesInput, 'Updated notes');

      const submitButton = screen.getByText('Update Submission');
      await user.click(submitButton);

      expect(screen.getByText('Updating...')).toBeInTheDocument();

      await waitFor(() => {
        expect(learnAPI.updateSubmission).toHaveBeenCalledWith('1', {
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: 'Updated notes',
          is_public: true,
        });
        expect(mockOnSubmit).toHaveBeenCalledWith(mockResponse.data);
      });
    });

    it('should handle submission with only GitHub URL', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        data: { 
          id: 1,
          assignment: 1,
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: '',
          notes: '',
          is_public: false
        } 
      };
      learnAPI.submitAssignment.mockResolvedValueOnce(mockResponse);

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'https://github.com/user/todo-app');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(learnAPI.submitAssignment).toHaveBeenCalledWith('1', {
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: '',
          notes: '',
          is_public: false,
        });
      });
    });

    it('should handle submission with only live preview URL', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        data: { 
          id: 1,
          assignment: 1,
          github_repo_url: '',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: '',
          is_public: false
        } 
      };
      learnAPI.submitAssignment.mockResolvedValueOnce(mockResponse);

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const previewInput = screen.getByLabelText(/Live Preview URL/);
      await user.type(previewInput, 'https://todo-app.netlify.app');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(learnAPI.submitAssignment).toHaveBeenCalledWith('1', {
          github_repo_url: '',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: '',
          is_public: false,
        });
      });
    });

    it('should reset form after successful new submission', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        data: { 
          id: 1,
          assignment: 1,
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: '',
          notes: '',
          is_public: false
        } 
      };
      learnAPI.submitAssignment.mockResolvedValueOnce(mockResponse);

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'https://github.com/user/todo-app');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(githubInput.value).toBe('');
      });
    });

    it('should not reset form after updating existing submission', async () => {
      const user = userEvent.setup();
      const mockResponse = { 
        data: { 
          id: 1,
          assignment: 1,
          github_repo_url: 'https://github.com/user/todo-app',
          live_preview_url: 'https://todo-app.netlify.app',
          notes: 'This was challenging but fun!',
          is_public: true
        } 
      };
      learnAPI.updateSubmission.mockResolvedValueOnce(mockResponse);

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          existingSubmission={mockExistingSubmission}
          onSubmit={mockOnSubmit}
        />
      );

      const submitButton = screen.getByText('Update Submission');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('https://github.com/user/todo-app')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should show Django API error message', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Assignment submission failed';
      learnAPI.submitAssignment.mockRejectedValueOnce({
        response: { 
          status: 400,
          data: { 
            detail: errorMessage 
          } 
        }
      });

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'https://github.com/user/todo-app');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show Django validation errors', async () => {
      const user = userEvent.setup();
      learnAPI.submitAssignment.mockRejectedValueOnce({
        response: { 
          status: 400,
          data: { 
            github_repo_url: ['Enter a valid URL.'],
            notes: ['This field may not be blank.']
          } 
        }
      });

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'invalid-url');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid URL.')).toBeInTheDocument();
      });
    });

    it('should show fallback error message', async () => {
      const user = userEvent.setup();
      learnAPI.submitAssignment.mockRejectedValueOnce(new Error('Network error'));

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      const githubInput = screen.getByLabelText(/GitHub Repository URL/);
      await user.type(githubInput, 'https://github.com/user/todo-app');

      const submitButton = screen.getByText('Submit Assignment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Cancel functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not show cancel button when onCancel is not provided', () => {
      render(
        <AssignmentSubmissionForm
          assignment={mockAssignment}
          onSubmit={mockOnSubmit}
        />
      );

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });
});