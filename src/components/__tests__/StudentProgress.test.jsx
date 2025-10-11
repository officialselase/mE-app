import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentProgress from '../StudentProgress';
import { apiClient } from '../../utils/api';

// Mock the API client
vi.mock('../../utils/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('StudentProgress', () => {
  const mockProgressData = {
    course_id: '1',
    completed_lessons: ['lesson1', 'lesson2', 'lesson3'],
    total_lessons: 10,
    progress_percentage: 30,
    next_lesson: {
      id: 'lesson4',
      title: 'Advanced React Hooks',
      order: 4,
      description: 'Learn about useEffect, useContext, and custom hooks',
    },
  };

  const mockOnLessonRecommendation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show loading skeleton when fetching progress', () => {
      apiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error message when API fails', async () => {
      const errorMessage = 'Failed to fetch progress';
      apiClient.get.mockRejectedValueOnce({
        response: { data: { error: errorMessage } }
      });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      apiClient.get.mockRejectedValueOnce(networkError);

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle errors without specific message', async () => {
      apiClient.get.mockRejectedValueOnce({});

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch progress')).toBeInTheDocument();
      });
    });

    it('should retry fetching progress when try again is clicked', async () => {
      apiClient.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: mockProgressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Your Progress')).toBeInTheDocument();
      });

      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Progress display', () => {
    it('should display progress from API data', async () => {
      apiClient.get.mockResolvedValueOnce({ data: mockProgressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Your Progress')).toBeInTheDocument();
      });

      expect(screen.getByText('3 of 10 lessons completed')).toBeInTheDocument();
      expect(screen.getAllByText('30%')).toHaveLength(2); // Header and progress bar
      expect(screen.getByText('3')).toBeInTheDocument(); // Completed count
      expect(screen.getByText('7')).toBeInTheDocument(); // Remaining count
    });

    it('should display progress from props when API data not available', async () => {
      apiClient.get.mockResolvedValueOnce({ data: {} });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={['lesson1', 'lesson2']}
          totalLessons={8}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Your Progress')).toBeInTheDocument();
      });

      expect(screen.getByText('2 of 8 lessons completed')).toBeInTheDocument();
      expect(screen.getAllByText('25%')).toHaveLength(2); // Header and progress bar
      expect(screen.getByText('2')).toBeInTheDocument(); // Completed count
      expect(screen.getByText('6')).toBeInTheDocument(); // Remaining count
    });

    it('should handle zero progress correctly', async () => {
      apiClient.get.mockResolvedValueOnce({
        data: {
          completed_lessons: [],
          total_lessons: 5,
          progress_percentage: 0,
        }
      });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('0 of 5 lessons completed')).toBeInTheDocument();
      });

      expect(screen.getAllByText('0%')).toHaveLength(2); // Header and progress bar
      expect(screen.getByText('5')).toBeInTheDocument(); // Remaining count
    });

    it('should handle 100% progress correctly', async () => {
      const completedProgressData = {
        completed_lessons: ['lesson1', 'lesson2', 'lesson3'],
        total_lessons: 3,
        progress_percentage: 100,
      };

      apiClient.get.mockResolvedValueOnce({ data: completedProgressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🎉 Course Completed!')).toBeInTheDocument();
      });

      expect(screen.getAllByText('100%')).toHaveLength(2); // Header and progress bar
      expect(screen.getByText('Congratulations! You\'ve completed all lessons in this course.')).toBeInTheDocument();
    });
  });

  describe('Next lesson recommendation', () => {
    it('should display next lesson when available', async () => {
      apiClient.get.mockResolvedValueOnce({ data: mockProgressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Continue Learning')).toBeInTheDocument();
      });

      expect(screen.getByText('Next: Advanced React Hooks')).toBeInTheDocument();
      expect(screen.getByText('Lesson 4')).toBeInTheDocument();
      expect(screen.getByText('Learn about useEffect, useContext, and custom hooks')).toBeInTheDocument();
      expect(screen.getByText('Start Lesson')).toBeInTheDocument();
    });

    it('should call onLessonRecommendation when start lesson is clicked', async () => {
      apiClient.get.mockResolvedValueOnce({ data: mockProgressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Start Lesson')).toBeInTheDocument();
      });

      const startLessonButton = screen.getByText('Start Lesson');
      fireEvent.click(startLessonButton);

      expect(mockOnLessonRecommendation).toHaveBeenCalledWith(mockProgressData.next_lesson);
    });

    it('should not call onLessonRecommendation when callback not provided', async () => {
      apiClient.get.mockResolvedValueOnce({ data: mockProgressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Start Lesson')).toBeInTheDocument();
      });

      const startLessonButton = screen.getByText('Start Lesson');
      fireEvent.click(startLessonButton);

      // Should not throw error
      expect(mockOnLessonRecommendation).not.toHaveBeenCalled();
    });

    it('should show encouragement message when no next lesson and not completed', async () => {
      const progressWithoutNextLesson = {
        completed_lessons: ['lesson1'],
        total_lessons: 5,
        progress_percentage: 20,
      };

      apiClient.get.mockResolvedValueOnce({ data: progressWithoutNextLesson });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Keep going! You\'re making great progress.')).toBeInTheDocument();
      });
    });
  });

  describe('Achievement badges', () => {
    it('should show "Getting Started" badge at 25% progress', async () => {
      const progressData = {
        completed_lessons: ['lesson1'],
        total_lessons: 4,
        progress_percentage: 25,
      };

      apiClient.get.mockResolvedValueOnce({ data: progressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🌟 Getting Started')).toBeInTheDocument();
      });
    });

    it('should show "Halfway There" badge at 50% progress', async () => {
      const progressData = {
        completed_lessons: ['lesson1', 'lesson2'],
        total_lessons: 4,
        progress_percentage: 50,
      };

      apiClient.get.mockResolvedValueOnce({ data: progressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🌟 Getting Started')).toBeInTheDocument();
        expect(screen.getByText('🚀 Halfway There')).toBeInTheDocument();
      });
    });

    it('should show "Almost Done" badge at 75% progress', async () => {
      const progressData = {
        completed_lessons: ['lesson1', 'lesson2', 'lesson3'],
        total_lessons: 4,
        progress_percentage: 75,
      };

      apiClient.get.mockResolvedValueOnce({ data: progressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🌟 Getting Started')).toBeInTheDocument();
        expect(screen.getByText('🚀 Halfway There')).toBeInTheDocument();
        expect(screen.getByText('💪 Almost Done')).toBeInTheDocument();
      });
    });

    it('should show "Course Master" badge at 100% progress', async () => {
      const progressData = {
        completed_lessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4'],
        total_lessons: 4,
        progress_percentage: 100,
      };

      apiClient.get.mockResolvedValueOnce({ data: progressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('🌟 Getting Started')).toBeInTheDocument();
        expect(screen.getByText('🚀 Halfway There')).toBeInTheDocument();
        expect(screen.getByText('💪 Almost Done')).toBeInTheDocument();
        expect(screen.getByText('🏆 Course Master')).toBeInTheDocument();
      });
    });

    it('should not show achievement badges when progress is 0', async () => {
      const progressData = {
        completed_lessons: [],
        total_lessons: 4,
        progress_percentage: 0,
      };

      apiClient.get.mockResolvedValueOnce({ data: progressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Your Progress')).toBeInTheDocument();
      });

      expect(screen.queryByText('Achievements')).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should not fetch progress when courseId is not provided', () => {
      render(
        <StudentProgress
          courseId=""
          completedLessons={['lesson1']}
          totalLessons={5}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should handle missing next lesson description', async () => {
      const progressDataWithoutDescription = {
        ...mockProgressData,
        next_lesson: {
          id: 'lesson4',
          title: 'Advanced React Hooks',
          order: 4,
        },
      };

      apiClient.get.mockResolvedValueOnce({ data: progressDataWithoutDescription });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Next: Advanced React Hooks')).toBeInTheDocument();
      });

      expect(screen.getByText('Lesson 4')).toBeInTheDocument();
      expect(screen.queryByText('Learn about useEffect, useContext, and custom hooks')).not.toBeInTheDocument();
    });

    it('should handle division by zero for progress calculation', async () => {
      apiClient.get.mockResolvedValueOnce({
        data: {
          completed_lessons: [],
          total_lessons: 0,
        }
      });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('0 of 0 lessons completed')).toBeInTheDocument();
      });

      expect(screen.getAllByText('0%')).toHaveLength(2); // Header and progress bar
    });

    it('should refetch progress when courseId changes', async () => {
      apiClient.get.mockResolvedValue({ data: mockProgressData });

      const { rerender } = render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/api/courses/1/progress');
      });

      rerender(
        <StudentProgress
          courseId="2"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith('/api/courses/2/progress');
      });

      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Progress bar animation', () => {
    it('should set correct width for progress bar', async () => {
      apiClient.get.mockResolvedValueOnce({ data: mockProgressData });

      render(
        <StudentProgress
          courseId="1"
          completedLessons={[]}
          totalLessons={0}
          onLessonRecommendation={mockOnLessonRecommendation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Your Progress')).toBeInTheDocument();
      });

      const progressBars = document.querySelectorAll('.bg-gradient-to-r');
      const progressFill = Array.from(progressBars).find(el => 
        el.style.width === '30%'
      );
      expect(progressFill).toBeTruthy();
      expect(progressFill).toHaveStyle('width: 30%');
    });
  });
});