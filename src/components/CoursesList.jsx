import React from 'react';
import CourseCard from './CourseCard';
import SkeletonLoader from './SkeletonLoader';

const CoursesList = ({ courses, loading, error, onEnroll, onRetry }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <SkeletonLoader key={index} variant="card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Courses</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Available</h3>
          <p className="text-gray-600">
            There are no courses available at the moment. Check back later for new learning opportunities!
          </p>
        </div>
      </div>
    );
  }

  // Separate enrolled and available courses
  const enrolledCourses = courses.filter(course => course.is_enrolled);
  const availableCourses = courses.filter(course => !course.is_enrolled);

  return (
    <div className="space-y-8">
      {/* Enrolled Courses Section */}
      {enrolledCourses.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={onEnroll}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Courses Section */}
      {availableCourses.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {enrolledCourses.length > 0 ? 'Available Courses' : 'All Courses'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={onEnroll}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesList;