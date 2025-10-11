import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from '../CourseCard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CourseCard', () => {
  const mockCourse = {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React including components, state, and props. This comprehensive course will take you from beginner to intermediate level.',
    instructor_name: 'John Doe',
    created_at: '2024-01-15T10:00:00Z',
    is_enrolled: false,
  };

  const mockEnrolledCourse = {
    ...mockCourse,
    is_enrolled: true,
  };

  const mockOnEnroll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Rendering', () => {
    it('should render course information correctly', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Learn the basics of React including components, state, and props. This comprehensive course will take you from beginner to intermediate level.')).toBeInTheDocument();
      expect(screen.getByText('Instructor: John Doe')).toBeInTheDocument();
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    });

    it('should show enrolled badge for enrolled courses', () => {
      renderWithRouter(
        <CourseCard course={mockEnrolledCourse} onEnroll={mockOnEnroll} />
      );

      expect(screen.getByText('Enrolled')).toBeInTheDocument();
      expect(screen.getByText('Enrolled')).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should not show enrolled badge for non-enrolled courses', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      expect(screen.queryByText('Enrolled')).not.toBeInTheDocument();
    });

    it('should truncate long titles and descriptions', () => {
      const courseWithLongContent = {
        ...mockCourse,
        title: 'This is a very long course title that should be truncated when it exceeds the maximum length allowed',
        description: 'This is a very long description that should be truncated when it exceeds the maximum length allowed for the course description in the card component. It should show only the first few lines.',
      };

      renderWithRouter(
        <CourseCard course={courseWithLongContent} onEnroll={mockOnEnroll} />
      );

      const titleElement = screen.getByText(courseWithLongContent.title);
      const descriptionElement = screen.getByText(courseWithLongContent.description);

      expect(titleElement).toHaveClass('line-clamp-2');
      expect(descriptionElement).toHaveClass('line-clamp-3');
    });
  });

  describe('Enrollment functionality', () => {
    it('should show "Enroll Now" button for non-enrolled courses', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      expect(screen.getByText('Enroll Now')).toBeInTheDocument();
      expect(screen.queryByText('Continue Learning')).not.toBeInTheDocument();
    });

    it('should show "Continue Learning" button for enrolled courses', () => {
      renderWithRouter(
        <CourseCard course={mockEnrolledCourse} onEnroll={mockOnEnroll} />
      );

      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
      expect(screen.queryByText('Enroll Now')).not.toBeInTheDocument();
    });

    it('should call onEnroll when enroll button is clicked', async () => {
      mockOnEnroll.mockResolvedValueOnce();

      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const enrollButton = screen.getByText('Enroll Now');
      fireEvent.click(enrollButton);

      expect(mockOnEnroll).toHaveBeenCalledWith('1');
    });

    it('should show loading state during enrollment', async () => {
      mockOnEnroll.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const enrollButton = screen.getByText('Enroll Now');
      fireEvent.click(enrollButton);

      expect(screen.getByText('Enrolling...')).toBeInTheDocument();
      expect(screen.getByText('Enrolling...')).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText('Enrolling...')).not.toBeInTheDocument();
      });
    });

    it('should handle enrollment errors gracefully', async () => {
      mockOnEnroll.mockRejectedValueOnce(new Error('Enrollment failed'));

      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const enrollButton = screen.getByText('Enroll Now');
      fireEvent.click(enrollButton);

      await waitFor(() => {
        expect(screen.getByText('Enroll Now')).toBeInTheDocument();
        expect(screen.getByText('Enroll Now')).not.toBeDisabled();
      });
    });

    it('should prevent multiple enrollment attempts', async () => {
      mockOnEnroll.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const enrollButton = screen.getByText('Enroll Now');
      
      // Click multiple times rapidly
      fireEvent.click(enrollButton);
      fireEvent.click(enrollButton);
      fireEvent.click(enrollButton);

      // Should only call onEnroll once
      expect(mockOnEnroll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation functionality', () => {
    it('should navigate to course detail when "Continue Learning" is clicked', () => {
      renderWithRouter(
        <CourseCard course={mockEnrolledCourse} onEnroll={mockOnEnroll} />
      );

      const continueButton = screen.getByText('Continue Learning');
      fireEvent.click(continueButton);

      expect(mockNavigate).toHaveBeenCalledWith('/learn/courses/1');
    });

    it('should navigate to course detail when "View Details" is clicked', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.click(viewDetailsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/learn/courses/1');
    });

    it('should navigate to course detail when enrolled course "View Details" is clicked', () => {
      renderWithRouter(
        <CourseCard course={mockEnrolledCourse} onEnroll={mockOnEnroll} />
      );

      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.click(viewDetailsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/learn/courses/1');
    });
  });

  describe('Button styling', () => {
    it('should apply correct styles to enroll button', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const enrollButton = screen.getByText('Enroll Now');
      expect(enrollButton).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    });

    it('should apply correct styles to continue learning button', () => {
      renderWithRouter(
        <CourseCard course={mockEnrolledCourse} onEnroll={mockOnEnroll} />
      );

      const continueButton = screen.getByText('Continue Learning');
      expect(continueButton).toHaveClass('bg-indigo-600', 'text-white', 'hover:bg-indigo-700');
    });

    it('should apply correct styles to view details button', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const viewDetailsButton = screen.getByText('View Details');
      expect(viewDetailsButton).toHaveClass('border-gray-300', 'text-gray-700', 'hover:bg-gray-50');
    });

    it('should apply disabled styles when enrolling', async () => {
      mockOnEnroll.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const enrollButton = screen.getByText('Enroll Now');
      fireEvent.click(enrollButton);

      const enrollingButton = screen.getByText('Enrolling...');
      expect(enrollingButton).toHaveClass('disabled:bg-blue-400', 'disabled:cursor-not-allowed');
      expect(enrollingButton).toBeDisabled();
    });
  });

  describe('Card styling and interactions', () => {
    it('should apply hover effects to the card', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const card = screen.getByText('React Fundamentals').closest('div').closest('div');
      expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow');
    });

    it('should have proper card structure', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      const card = screen.getByText('React Fundamentals').closest('div').closest('div');
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'overflow-hidden');
    });
  });

  describe('Date formatting', () => {
    it('should format creation date correctly', () => {
      renderWithRouter(
        <CourseCard course={mockCourse} onEnroll={mockOnEnroll} />
      );

      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
    });

    it('should handle invalid dates gracefully', () => {
      const courseWithInvalidDate = {
        ...mockCourse,
        created_at: 'invalid-date',
      };

      renderWithRouter(
        <CourseCard course={courseWithInvalidDate} onEnroll={mockOnEnroll} />
      );

      // Should not crash and should render the card
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing instructor name', () => {
      const courseWithoutInstructor = {
        ...mockCourse,
        instructor_name: null,
      };

      renderWithRouter(
        <CourseCard course={courseWithoutInstructor} onEnroll={mockOnEnroll} />
      );

      expect(screen.getByText('Instructor:')).toBeInTheDocument();
    });

    it('should handle missing description', () => {
      const courseWithoutDescription = {
        ...mockCourse,
        description: null,
      };

      renderWithRouter(
        <CourseCard course={courseWithoutDescription} onEnroll={mockOnEnroll} />
      );

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });

    it('should handle missing title', () => {
      const courseWithoutTitle = {
        ...mockCourse,
        title: null,
      };

      renderWithRouter(
        <CourseCard course={courseWithoutTitle} onEnroll={mockOnEnroll} />
      );

      // Should still render the card structure
      expect(screen.getByText('Instructor: John Doe')).toBeInTheDocument();
    });
  });
});