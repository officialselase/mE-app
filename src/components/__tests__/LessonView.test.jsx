import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonView from '../LessonView';
import { apiClient } from '../../utils/api';

// Mock the API client
vi.mock('../../utils/api', () => ({
  apiClient: {
    put: vi.fn(),
  },
}));

// Mock VideoPlayer component
vi.mock('../VideoPlayer', () => ({
  default: ({ videoUrl }) => <div data-testid="video-player">Video: {videoUrl}</div>,
}));

describe('LessonView', () => {
  const mockLesson = {
    id: '1',
    title: 'Introduction to React',
    content: 'This is the lesson content about React basics.',
    order: 1,
    video_url: 'https://example.com/video.mp4',
  };

  const mockAssignments = [
    {
      id: '1',
      title: 'Build a Todo App',
      description: 'Create a simple todo application using React',
      type: 'project',
      due_date: '2024-12-31',
      required: true,
    },
    {
      id: '2',
      title: 'React Quiz',
      description: 'Test your knowledge of React concepts',
      type: 'quiz',
      required: false,
    },
  ];

  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render lesson content correctly', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
          assignments={mockAssignments}
        />
      );

      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getByText('Lesson 1')).toBeInTheDocument();
      expect(screen.getByText('This is the lesson content about React basics.')).toBeInTheDocument();
    });

    it('should render video player when video URL is provided', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      expect(screen.getByTestId('video-player')).toBeInTheDocument();
      expect(screen.getByText('Video: https://example.com/video.mp4')).toBeInTheDocument();
    });

    it('should not render video section when no video URL', () => {
      const lessonWithoutVideo = { ...mockLesson, video_url: null };
      
      render(
        <LessonView
          lesson={lessonWithoutVideo}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
      expect(screen.queryByText('Lesson Video')).not.toBeInTheDocument();
    });

    it('should render assignments when provided', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
          assignments={mockAssignments}
        />
      );

      expect(screen.getByText('Assignments (2)')).toBeInTheDocument();
      expect(screen.getByText('Build a Todo App')).toBeInTheDocument();
      expect(screen.getByText('React Quiz')).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    it('should not render assignments section when no assignments', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
          assignments={[]}
        />
      );

      expect(screen.queryByText('Assignments')).not.toBeInTheDocument();
    });

    it('should show "No lesson selected" when lesson is null', () => {
      render(
        <LessonView
          lesson={null}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      expect(screen.getByText('No lesson selected')).toBeInTheDocument();
    });
  });

  describe('Lesson completion', () => {
    it('should show "Mark as Complete" button when lesson is not completed', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      expect(screen.getByText('Mark as Complete')).toBeInTheDocument();
    });

    it('should show "Completed" status when lesson is completed', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={true}
        />
      );

      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.queryByText('Mark as Complete')).not.toBeInTheDocument();
    });

    it('should call API and onComplete when mark as complete is clicked', async () => {
      apiClient.put.mockResolvedValueOnce({ data: { success: true } });

      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      const completeButton = screen.getByText('Mark as Complete');
      fireEvent.click(completeButton);

      expect(screen.getByText('Marking Complete...')).toBeInTheDocument();

      await waitFor(() => {
        expect(apiClient.put).toHaveBeenCalledWith('/api/lessons/1/complete');
        expect(mockOnComplete).toHaveBeenCalledWith('1');
      });
    });

    it('should show error message when completion fails', async () => {
      const errorMessage = 'Failed to mark lesson as complete';
      apiClient.put.mockRejectedValueOnce({
        response: { data: { error: errorMessage } }
      });

      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      const completeButton = screen.getByText('Mark as Complete');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should not allow multiple completion attempts', async () => {
      apiClient.put.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      const completeButton = screen.getByText('Mark as Complete');
      
      // Click multiple times rapidly
      fireEvent.click(completeButton);
      fireEvent.click(completeButton);
      fireEvent.click(completeButton);

      // Should only make one API call
      expect(apiClient.put).toHaveBeenCalledTimes(1);
    });
  });

  describe('Assignment interactions', () => {
    it('should dispatch custom event when "View Assignment" is clicked', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
          assignments={mockAssignments}
        />
      );

      const viewAssignmentButton = screen.getAllByText('View Assignment →')[0];
      fireEvent.click(viewAssignmentButton);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'viewAssignment',
          detail: { assignmentId: '1' }
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('should format due dates correctly', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
          assignments={mockAssignments}
        />
      );

      expect(screen.getByText(/Due: 12\/31\/2024/)).toBeInTheDocument();
    });

    it('should show assignment types correctly', () => {
      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
          assignments={mockAssignments}
        />
      );

      expect(screen.getByText('project')).toBeInTheDocument();
      expect(screen.getByText('quiz')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      apiClient.put.mockRejectedValueOnce(new Error('Network error'));

      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      const completeButton = screen.getByText('Mark as Complete');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle API errors with fallback message', async () => {
      apiClient.put.mockRejectedValueOnce({});

      render(
        <LessonView
          lesson={mockLesson}
          onComplete={mockOnComplete}
          isCompleted={false}
        />
      );

      const completeButton = screen.getByText('Mark as Complete');
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to mark lesson as complete')).toBeInTheDocument();
      });
    });
  });
});