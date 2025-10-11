import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoursesList from '../CoursesList';

// Mock CourseCard component
vi.mock('../CourseCard', () => ({
  default: ({ course, onEnroll }) => (
    <div data-testid={`course-card-${course.id}`}>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <span>{course.is_enrolled ? 'Enrolled' : 'Available'}</span>
      <button onClick={() => onEnroll(course.id)}>
        {course.is_enrolled ? 'Continue' : 'Enroll'}
      </button>
    </div>
  ),
}));

// Mock SkeletonLoader component
vi.mock('../SkeletonLoader', () => ({
  default: ({ variant }) => <div data-testid={`skeleton-${variant}`}>Loading...</div>,
}));

describe('CoursesList', () => {
  const mockCourses = [
    {
      id: '1',
      title: 'React Fundamentals',
      description: 'Learn the basics of React',
      is_enrolled: true,
    },
    {
      id: '2',
      title: 'Advanced JavaScript',
      description: 'Deep dive into JavaScript concepts',
      is_enrolled: false,
    },
    {
      id: '3',
      title: 'Node.js Backend',
      description: 'Build backend applications with Node.js',
      is_enrolled: true,
    },
    {
      id: '4',
      title: 'CSS Grid & Flexbox',
      description: 'Master modern CSS layout techniques',
      is_enrolled: false,
    },
  ];

  const mockOnEnroll = vi.fn();
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('Loading state', () => {
    it('should show skeleton loaders when loading', () => {
      renderWithRouter(
        <CoursesList
          courses={[]}
          loading={true}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      const skeletons = screen.getAllByTestId('skeleton-card');
      expect(skeletons).toHaveLength(6);
    });
  });

  describe('Error state', () => {
    it('should show error message and retry button', () => {
      const errorMessage = 'Failed to load courses';

      renderWithRouter(
        <CoursesList
          courses={[]}
          loading={false}
          error={errorMessage}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('Failed to Load Courses')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      renderWithRouter(
        <CoursesList
          courses={[]}
          loading={false}
          error="Network error"
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no courses available', () => {
      renderWithRouter(
        <CoursesList
          courses={[]}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('No Courses Available')).toBeInTheDocument();
      expect(screen.getByText('There are no courses available at the moment. Check back later for new learning opportunities!')).toBeInTheDocument();
    });

    it('should show empty state when courses is null', () => {
      renderWithRouter(
        <CoursesList
          courses={null}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('No Courses Available')).toBeInTheDocument();
    });
  });

  describe('Courses display', () => {
    it('should render all courses when none are enrolled', () => {
      const unenrolledCourses = mockCourses.map(course => ({ ...course, is_enrolled: false }));

      renderWithRouter(
        <CoursesList
          courses={unenrolledCourses}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('All Courses')).toBeInTheDocument();
      expect(screen.getByTestId('course-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('course-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('course-card-3')).toBeInTheDocument();
      expect(screen.getByTestId('course-card-4')).toBeInTheDocument();
    });

    it('should separate enrolled and available courses', () => {
      renderWithRouter(
        <CoursesList
          courses={mockCourses}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('My Courses')).toBeInTheDocument();
      expect(screen.getByText('Available Courses')).toBeInTheDocument();

      // Check that enrolled courses are in the "My Courses" section
      const myCourses = screen.getByText('My Courses').closest('div');
      expect(myCourses).toContainElement(screen.getByTestId('course-card-1'));
      expect(myCourses).toContainElement(screen.getByTestId('course-card-3'));

      // Check that available courses are in the "Available Courses" section
      const availableCourses = screen.getByText('Available Courses').closest('div');
      expect(availableCourses).toContainElement(screen.getByTestId('course-card-2'));
      expect(availableCourses).toContainElement(screen.getByTestId('course-card-4'));
    });

    it('should show only enrolled courses when no available courses', () => {
      const enrolledOnlyCourses = mockCourses.map(course => ({ ...course, is_enrolled: true }));

      renderWithRouter(
        <CoursesList
          courses={enrolledOnlyCourses}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('My Courses')).toBeInTheDocument();
      expect(screen.queryByText('Available Courses')).not.toBeInTheDocument();
      expect(screen.queryByText('All Courses')).not.toBeInTheDocument();
    });

    it('should pass onEnroll function to CourseCard components', () => {
      renderWithRouter(
        <CoursesList
          courses={mockCourses}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      const enrollButton = screen.getAllByText('Enroll')[0];
      fireEvent.click(enrollButton);

      expect(mockOnEnroll).toHaveBeenCalled();
    });
  });

  describe('Course card rendering', () => {
    it('should render course titles and descriptions', () => {
      renderWithRouter(
        <CoursesList
          courses={mockCourses}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Learn the basics of React')).toBeInTheDocument();
      expect(screen.getByText('Advanced JavaScript')).toBeInTheDocument();
      expect(screen.getByText('Deep dive into JavaScript concepts')).toBeInTheDocument();
      expect(screen.getByText('Node.js Backend')).toBeInTheDocument();
      expect(screen.getByText('Build backend applications with Node.js')).toBeInTheDocument();
      expect(screen.getByText('CSS Grid & Flexbox')).toBeInTheDocument();
      expect(screen.getByText('Master modern CSS layout techniques')).toBeInTheDocument();
    });

    it('should show enrollment status correctly', () => {
      renderWithRouter(
        <CoursesList
          courses={mockCourses}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      const enrolledStatuses = screen.getAllByText('Enrolled');
      const availableStatuses = screen.getAllByText('Available');

      expect(enrolledStatuses).toHaveLength(2); // Courses 1 and 3
      expect(availableStatuses).toHaveLength(2); // Courses 2 and 4
    });
  });

  describe('Grid layout', () => {
    it('should use responsive grid layout', () => {
      renderWithRouter(
        <CoursesList
          courses={mockCourses}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      const grids = screen.getAllByRole('generic').filter(el => 
        el.className.includes('grid-cols-1') && 
        el.className.includes('md:grid-cols-2') && 
        el.className.includes('lg:grid-cols-3')
      );

      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle courses with missing properties gracefully', () => {
      const coursesWithMissingProps = [
        {
          id: '1',
          title: 'Course 1',
          // Missing description and is_enrolled
        },
        {
          id: '2',
          // Missing title
          description: 'Course 2 description',
          is_enrolled: false,
        },
      ];

      renderWithRouter(
        <CoursesList
          courses={coursesWithMissingProps}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByTestId('course-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('course-card-2')).toBeInTheDocument();
    });

    it('should handle single course correctly', () => {
      const singleCourse = [mockCourses[0]];

      renderWithRouter(
        <CoursesList
          courses={singleCourse}
          loading={false}
          error={null}
          onEnroll={mockOnEnroll}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('My Courses')).toBeInTheDocument();
      expect(screen.getByTestId('course-card-1')).toBeInTheDocument();
      expect(screen.queryByText('Available Courses')).not.toBeInTheDocument();
    });
  });
});