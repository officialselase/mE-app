import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Learn from '../Learn';
import { useAuth } from '../../context/AuthContext';
import useCourses from '../../hooks/useCourses';

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the useCourses hook
vi.mock('../../hooks/useCourses', () => ({
  default: vi.fn(),
}));

// Mock VideoPlayer component
vi.mock('../../components/VideoPlayer', () => ({
  default: ({ videoUrl }) => <div data-testid="video-player">Video: {videoUrl}</div>,
}));

// Mock CoursesList component
vi.mock('../../components/CoursesList', () => ({
  default: ({ courses, loading, error, onEnroll, onRetry }) => {
    if (loading) {return <div data-testid="courses-loading">Loading courses...</div>;}
    if (error) {return (
      <div data-testid="courses-error">
        <span>Error: {error}</span>
        <button onClick={onRetry}>Retry</button>
      </div>
    );}
    return (
      <div data-testid="courses-list">
        {courses.map(course => (
          <div key={course.id} data-testid={`course-${course.id}`}>
            <span>{course.title}</span>
            <button onClick={() => onEnroll(course.id)}>
              {course.is_enrolled ? 'Continue' : 'Enroll'}
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Learn', () => {
  const mockCourses = [
    {
      id: '1',
      title: 'React Fundamentals',
      description: 'Learn the basics of React',
      is_enrolled: false,
    },
    {
      id: '2',
      title: 'Advanced JavaScript',
      description: 'Deep dive into JavaScript concepts',
      is_enrolled: true,
    },
  ];

  const mockUseCourses = {
    courses: mockCourses,
    loading: false,
    error: null,
    enrollInCourse: vi.fn(),
    retry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });
    useCourses.mockReturnValue(mockUseCourses);
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Basic rendering', () => {
    it('should render main sections for unauthenticated users', () => {
      renderWithRouter(<Learn />);

      expect(screen.getByText('Learn, Grow, Build Your Future')).toBeInTheDocument();
      expect(screen.getByText('Our Mission')).toBeInTheDocument();
      expect(screen.getByText('Why Learn to Code?')).toBeInTheDocument();
      expect(screen.getByText('See Coding in Action')).toBeInTheDocument();
      expect(screen.getByText('Ready to Join Our Coding Community?')).toBeInTheDocument();
      expect(screen.getByText('Showcase Your Work')).toBeInTheDocument();
    });

    it('should render video player', () => {
      renderWithRouter(<Learn />);

      expect(screen.getByTestId('video-player')).toBeInTheDocument();
      expect(screen.getByText('Video: https://youtu.be/TBdZsbNG8Z0?si=C0XGbGCjqFmPy8Js')).toBeInTheDocument();
    });

    it('should not show courses section for unauthenticated users', () => {
      renderWithRouter(<Learn />);

      expect(screen.queryByText('Available Courses')).not.toBeInTheDocument();
      expect(screen.queryByTestId('courses-list')).not.toBeInTheDocument();
    });

    it('should show courses section for authenticated users', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
      });

      renderWithRouter(<Learn />);

      expect(screen.getByText('Available Courses')).toBeInTheDocument();
      expect(screen.getByTestId('courses-list')).toBeInTheDocument();
    });
  });

  describe('Registration form', () => {
    it('should render registration form', () => {
      renderWithRouter(<Learn />);

      expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your Email')).toBeInTheDocument();
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Select dropdown
      expect(screen.getByText('Join Now')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Learn />);

      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const courseSelect = screen.getByRole('combobox');
      const submitButton = screen.getByText('Join Now');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.selectOptions(courseSelect, 'web');
      await user.click(submitButton);

      // Should show success popup
      expect(screen.getByText('Thank You!')).toBeInTheDocument();
      expect(screen.getByText('Your registration has been received. We\'ll contact you soon!')).toBeInTheDocument();

      // Form should be reset
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(courseSelect.value).toBe('');
    });

    it('should auto-close success popup after 3 seconds', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();
      renderWithRouter(<Learn />);

      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const courseSelect = screen.getByRole('combobox');
      const submitButton = screen.getByText('Join Now');

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.selectOptions(courseSelect, 'web');
      await user.click(submitButton);

      expect(screen.getByText('Thank You!')).toBeInTheDocument();

      // Fast-forward time
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('Thank You!')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should require all form fields', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Learn />);

      const submitButton = screen.getByText('Join Now');
      await user.click(submitButton);

      // Form should not submit without required fields
      expect(screen.queryByText('Thank You!')).not.toBeInTheDocument();
    });
  });

  describe('Course enrollment flow (authenticated users)', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({
        isAuthenticated: true,
      });
    });

    it('should show courses loading state', () => {
      useCourses.mockReturnValue({
        ...mockUseCourses,
        loading: true,
      });

      renderWithRouter(<Learn />);

      expect(screen.getByTestId('courses-loading')).toBeInTheDocument();
    });

    it('should show courses error state', () => {
      const errorMessage = 'Failed to load courses';
      useCourses.mockReturnValue({
        ...mockUseCourses,
        error: errorMessage,
      });

      renderWithRouter(<Learn />);

      expect(screen.getByTestId('courses-error')).toBeInTheDocument();
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should handle course enrollment successfully', async () => {
      const user = userEvent.setup();
      mockUseCourses.enrollInCourse.mockResolvedValueOnce();

      renderWithRouter(<Learn />);

      const enrollButton = screen.getByText('Enroll');
      await user.click(enrollButton);

      expect(mockUseCourses.enrollInCourse).toHaveBeenCalledWith('1');
      expect(screen.queryByText('Enrollment failed')).not.toBeInTheDocument();
    });

    it('should handle course enrollment errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Enrollment failed';
      mockUseCourses.enrollInCourse.mockRejectedValueOnce(new Error(errorMessage));

      renderWithRouter(<Learn />);

      const enrollButton = screen.getByText('Enroll');
      await user.click(enrollButton);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should auto-clear enrollment error after 5 seconds', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();
      const errorMessage = 'Enrollment failed';
      mockUseCourses.enrollInCourse.mockRejectedValueOnce(new Error(errorMessage));

      renderWithRouter(<Learn />);

      const enrollButton = screen.getByText('Enroll');
      await user.click(enrollButton);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      // Fast-forward time
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should handle courses retry', async () => {
      const user = userEvent.setup();
      useCourses.mockReturnValue({
        ...mockUseCourses,
        error: 'Network error',
      });

      renderWithRouter(<Learn />);

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      expect(mockUseCourses.retry).toHaveBeenCalled();
    });

    it('should clear enrollment error when enrolling in different course', async () => {
      const user = userEvent.setup();
      
      // First enrollment fails
      mockUseCourses.enrollInCourse
        .mockRejectedValueOnce(new Error('First enrollment failed'))
        .mockResolvedValueOnce(); // Second enrollment succeeds

      renderWithRouter(<Learn />);

      // First enrollment attempt
      const firstEnrollButton = screen.getByText('Enroll');
      await user.click(firstEnrollButton);

      expect(screen.getByText('First enrollment failed')).toBeInTheDocument();

      // Second enrollment attempt should clear the error
      const secondEnrollButton = screen.getByText('Continue'); // This is the enrolled course
      await user.click(secondEnrollButton);

      await waitFor(() => {
        expect(screen.queryByText('First enrollment failed')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to projects-repo when showcase button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Learn />);

      const showcaseButton = screen.getByText('🚀 Go to Student Repository →');
      await user.click(showcaseButton);

      expect(mockNavigate).toHaveBeenCalledWith('/projects-repo');
    });
  });

  describe('Contact information', () => {
    it('should display contact information', () => {
      renderWithRouter(<Learn />);

      expect(screen.getByText('Selase K. Agbai')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer at Fiberwave Ghana LTD')).toBeInTheDocument();
      expect(screen.getByText('+233 55 596 4195')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp me')).toBeInTheDocument();
    });

    it('should have correct contact links', () => {
      renderWithRouter(<Learn />);

      const phoneLink = screen.getByText('+233 55 596 4195').closest('a');
      const whatsappLink = screen.getByText('WhatsApp me').closest('a');

      expect(phoneLink).toHaveAttribute('href', 'tel:+233555964195');
      expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/233555964195');
      expect(whatsappLink).toHaveAttribute('target', '_blank');
      expect(whatsappLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Course selection options', () => {
    it('should have all course options in select dropdown', () => {
      renderWithRouter(<Learn />);

      const courseSelect = screen.getByRole('combobox');
      const options = Array.from(courseSelect.options).map(option => option.value);

      expect(options).toContain('web');
      expect(options).toContain('react');
      expect(options).toContain('django');
      expect(options).toContain('flutter');
      expect(options).toContain('scratch programming');
    });
  });

  describe('Responsive design elements', () => {
    it('should have responsive classes for mobile and desktop', () => {
      renderWithRouter(<Learn />);

      const heroSection = screen.getByText('Learn, Grow, Build Your Future').closest('section');
      expect(heroSection).toHaveClass('py-20');

      const gridSection = screen.getByText('Our Mission').closest('div').closest('div');
      expect(gridSection).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and structure', () => {
      renderWithRouter(<Learn />);

      const nameInput = screen.getByPlaceholderText('Your Name');
      const emailInput = screen.getByPlaceholderText('Your Email');
      const courseSelect = screen.getByRole('combobox');

      expect(nameInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(courseSelect).toHaveAttribute('required');
    });

    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Learn />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Learn, Grow, Build Your Future');
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(5); // Mission, Why Code, Video, Courses (if auth), Form, Showcase
    });
  });
});