import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmissionsList from '../SubmissionsList';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../utils/api';

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the API client
vi.mock('../../utils/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('SubmissionsList', () => {
  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockSubmissions = [
    {
      id: 'sub1',
      assignment_id: 'assign1',
      student_id: 'user1',
      student_name: 'Test User',
      github_repo_url: 'https://github.com/user1/project',
      live_preview_url: 'https://project.netlify.app',
      notes: 'This was a great learning experience!',
      submitted_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      is_public: true,
    },
    {
      id: 'sub2',
      assignment_id: 'assign1',
      student_id: 'user2',
      student_name: 'Another Student',
      github_repo_url: 'https://github.com/user2/project',
      live_preview_url: null,
      notes: 'Challenging but rewarding project.',
      submitted_at: '2024-01-14T15:30:00Z',
      updated_at: '2024-01-16T09:15:00Z',
      is_public: true,
    },
  ];

  const mockComments = [
    {
      id: 'comment1',
      submission_id: 'sub1',
      user_id: 'user2',
      user_name: 'Another Student',
      content: 'Great work on this project!',
      created_at: '2024-01-16T12:00:00Z',
    },
  ];

  const mockOnComment = vi.fn();
  const mockRefreshSubmissions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    apiClient.get.mockResolvedValue({ data: { comments: mockComments } });
  });

  describe('Rendering', () => {
    it('should render submissions list correctly', async () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      expect(screen.getByText('Student Submissions (2)')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Another Student')).toBeInTheDocument();
      expect(screen.getByText('Your Submission')).toBeInTheDocument();
    });

    it('should render empty state when no submissions', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={[]}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      expect(screen.getByText('No Submissions Yet')).toBeInTheDocument();
      expect(screen.getByText('Be the first to submit your work for this assignment! Other students\' public submissions will appear here.')).toBeInTheDocument();
    });

    it('should show refresh button when refreshSubmissions is provided', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
          refreshSubmissions={mockRefreshSubmissions}
        />
      );

      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    it('should highlight current user submission', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      const currentUserSubmission = screen.getByText('Your Submission').closest('div');
      expect(currentUserSubmission).toHaveClass('border-indigo-200', 'bg-indigo-50');
    });

    it('should show submission dates correctly', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      expect(screen.getByText(/Submitted 1\/15\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/Submitted 1\/14\/2024/)).toBeInTheDocument();
    });

    it('should show updated date when different from submitted date', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      expect(screen.getByText(/Updated 1\/16\/2024/)).toBeInTheDocument();
    });
  });

  describe('Project links', () => {
    it('should render GitHub and live preview links', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      const githubLinks = screen.getAllByText('View Code');
      const previewLinks = screen.getAllByText('Live Preview');

      expect(githubLinks).toHaveLength(2);
      expect(previewLinks).toHaveLength(1); // Only first submission has preview URL

      expect(githubLinks[0].closest('a')).toHaveAttribute('href', 'https://github.com/user1/project');
      expect(previewLinks[0].closest('a')).toHaveAttribute('href', 'https://project.netlify.app');
    });

    it('should open links in new tab', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      const githubLink = screen.getAllByText('View Code')[0].closest('a');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Student notes', () => {
    it('should display student notes when provided', () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      expect(screen.getByText('This was a great learning experience!')).toBeInTheDocument();
      expect(screen.getByText('Challenging but rewarding project.')).toBeInTheDocument();
    });

    it('should not show notes section when notes are empty', () => {
      const submissionsWithoutNotes = mockSubmissions.map(sub => ({ ...sub, notes: null }));

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={submissionsWithoutNotes}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      expect(screen.queryByText('Student Notes')).not.toBeInTheDocument();
    });
  });

  describe('Comments functionality', () => {
    it('should load and display comments', async () => {
      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Comments (1)')).toBeInTheDocument();
        expect(screen.getByText('Great work on this project!')).toBeInTheDocument();
        expect(screen.getByText('Another Student')).toBeInTheDocument();
      });

      expect(apiClient.get).toHaveBeenCalledWith('/api/submissions/sub1/comments');
      expect(apiClient.get).toHaveBeenCalledWith('/api/submissions/sub2/comments');
    });

    it('should show loading state while fetching comments', () => {
      apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      expect(screen.getAllByText('Loading comments...')).toHaveLength(2);
    });

    it('should show empty state when no comments', async () => {
      apiClient.get.mockResolvedValue({ data: { comments: [] } });

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText('No comments yet. Be the first to provide feedback!')).toHaveLength(2);
      });
    });

    it('should submit new comment', async () => {
      const user = userEvent.setup();
      const newComment = {
        id: 'comment2',
        submission_id: 'sub1',
        user_id: 'user1',
        user_name: 'Test User',
        content: 'Nice implementation!',
        created_at: '2024-01-17T10:00:00Z',
      };

      apiClient.post.mockResolvedValueOnce({ data: { comment: newComment } });

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText('Comments (1)')).toHaveLength(2);
      });

      const commentInputs = screen.getAllByPlaceholderText('Add a comment or feedback...');
      const commentButtons = screen.getAllByText('Comment');

      await user.type(commentInputs[0], 'Nice implementation!');
      await user.click(commentButtons[0]);

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/api/submissions/sub1/comments', {
          content: 'Nice implementation!',
        });
        expect(mockOnComment).toHaveBeenCalledWith('sub1', newComment);
      });

      // Comment should be added to the list
      expect(screen.getByText('Nice implementation!')).toBeInTheDocument();
      
      // Input should be cleared
      expect(commentInputs[0].value).toBe('');
    });

    it('should disable comment button when input is empty', async () => {
      const user = userEvent.setup();

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Comments (1)')).toBeInTheDocument();
      });

      const commentButtons = screen.getAllByText('Comment');
      expect(commentButtons[0]).toBeDisabled();

      const commentInput = screen.getAllByPlaceholderText('Add a comment or feedback...')[0];
      await user.type(commentInput, 'Test comment');

      expect(commentButtons[0]).not.toBeDisabled();

      await user.clear(commentInput);
      expect(commentButtons[0]).toBeDisabled();
    });

    it('should show loading state while submitting comment', async () => {
      const user = userEvent.setup();
      apiClient.post.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText('Comments (1)')).toHaveLength(2);
      });

      const commentInput = screen.getAllByPlaceholderText('Add a comment or feedback...')[0];
      const commentButton = screen.getAllByText('Comment')[0];

      await user.type(commentInput, 'Test comment');
      await user.click(commentButton);

      expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
    });

    it('should handle comment submission errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      apiClient.post.mockRejectedValueOnce(new Error('Comment failed'));

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText('Comments (1)')).toHaveLength(2);
      });

      const commentInput = screen.getAllByPlaceholderText('Add a comment or feedback...')[0];
      const commentButton = screen.getAllByText('Comment')[0];

      await user.type(commentInput, 'Test comment');
      await user.click(commentButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error submitting comment:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Refresh functionality', () => {
    it('should call refreshSubmissions when refresh button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
          refreshSubmissions={mockRefreshSubmissions}
        />
      );

      const refreshButton = screen.getByText('Refresh');
      await user.click(refreshButton);

      expect(mockRefreshSubmissions).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle comment loading errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      apiClient.get.mockRejectedValueOnce(new Error('Failed to load comments'));

      render(
        <SubmissionsList
          assignmentId="assign1"
          submissions={mockSubmissions}
          currentUserId="user1"
          onComment={mockOnComment}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching comments:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});