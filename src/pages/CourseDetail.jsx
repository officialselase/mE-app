import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LessonView from '../components/LessonView';
import StudentProgress from '../components/StudentProgress';
import SkeletonLoader from '../components/SkeletonLoader';
import MetaTags from '../components/MetaTags';
import { learnAPI, handleDjangoError } from '../utils/djangoApi';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { returnUrl: `/learn/courses/${courseId}` } 
      });
    }
  }, [isAuthenticated, navigate, courseId]);

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch course details
      const courseResponse = await learnAPI.getCourse(courseId);
      const courseData = courseResponse.data;
      
      // Check if user is enrolled by fetching enrollments
      try {
        const enrollmentsResponse = await learnAPI.getEnrollments();
        const enrollments = enrollmentsResponse.data.results || enrollmentsResponse.data;
        const enrollment = enrollments.find(e => e.course === parseInt(courseId));
        
        if (enrollment) {
          courseData.is_enrolled = true;
          courseData.enrollment = enrollment;
          setCompletedLessons(enrollment.completed_lessons || []);
          
          // Calculate progress
          const totalLessons = courseData.lessons?.length || 0;
          const completedCount = enrollment.completed_lessons?.length || 0;
          setProgress({
            completed_lessons: enrollment.completed_lessons || [],
            progress_percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
          });
        } else {
          courseData.is_enrolled = false;
        }
      } catch (enrollmentErr) {
        // If enrollment fetch fails, assume not enrolled
        courseData.is_enrolled = false;
      }
      
      setCourse(courseData);
      
      // Set the first lesson as selected by default
      if (courseData.lessons && courseData.lessons.length > 0) {
        setSelectedLesson(courseData.lessons[0]);
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      const djangoError = handleDjangoError(err);
      setError(djangoError.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const handleEnroll = useCallback(async () => {
    try {
      setEnrolling(true);
      setError(null);
      
      await learnAPI.enrollInCourse(courseId);
      
      // Refresh course data to show enrolled state
      await fetchCourseDetails();
    } catch (err) {
      console.error('Error enrolling in course:', err);
      const djangoError = handleDjangoError(err);
      setError(djangoError.message);
    } finally {
      setEnrolling(false);
    }
  }, [courseId, fetchCourseDetails]);

  const handleLessonComplete = useCallback(async (lessonId) => {
    try {
      // Call Django API to mark lesson as complete
      await learnAPI.completeLesson(lessonId);
      
      // Update local state
      const newCompletedLessons = [...completedLessons, lessonId];
      setCompletedLessons(newCompletedLessons);
      
      // Update progress
      if (course) {
        const totalLessons = course.lessons.length;
        const newProgress = {
          completed_lessons: newCompletedLessons,
          progress_percentage: Math.round((newCompletedLessons.length / totalLessons) * 100)
        };
        setProgress(newProgress);
      }
    } catch (err) {
      console.error('Error marking lesson as complete:', err);
      // You might want to show an error message to the user
    }
  }, [completedLessons, course]);

  const handleLessonSelect = useCallback((lesson) => {
    setSelectedLesson(lesson);
  }, []);

  const getNextLesson = useCallback(() => {
    if (!course || !selectedLesson) {return null;}
    
    const currentIndex = course.lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex < course.lessons.length - 1) {
      return course.lessons[currentIndex + 1];
    }
    return null;
  }, [course, selectedLesson]);

  const getPreviousLesson = useCallback(() => {
    if (!course || !selectedLesson) {return null;}
    
    const currentIndex = course.lessons.findIndex(l => l.id === selectedLesson.id);
    if (currentIndex > 0) {
      return course.lessons[currentIndex - 1];
    }
    return null;
  }, [course, selectedLesson]);

  useEffect(() => {
    if (courseId && isAuthenticated) {
      fetchCourseDetails();
    }
  }, [courseId, isAuthenticated, fetchCourseDetails]);

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <SkeletonLoader variant="card" />
            </div>
            <div className="lg:col-span-3">
              <SkeletonLoader variant="card" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Course</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchCourseDetails}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
            <p className="text-gray-600 mt-2">The course you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/learn')}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title={`${course?.title || 'Course'} - Learn - Selase K.`}
        description={course?.description || 'Learn with this comprehensive course from Selase K. Access lessons, assignments, and track your progress.'}
        keywords={`course, ${course?.title || 'learning'}, education, programming, web development, Selase Kofi Agbai`}
        url={`${window.location.origin}/courses/${courseId}`}
      />
      <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/learn')}
                className="text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-2 flex items-center"
              >
                ← Back to Courses
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
              <div className="flex items-center mt-4 space-x-4 text-sm text-gray-500">
                <span>Instructor: {course.instructor}</span>
                <span>•</span>
                <span>{course.lessons?.length || 0} lessons</span>
                {course.is_enrolled && progress && (
                  <>
                    <span>•</span>
                    <span>{progress.progress_percentage || 0}% complete</span>
                  </>
                )}
              </div>
            </div>
            
            {!course.is_enrolled && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            )}
          </div>
          
          {/* Progress Bar */}
          {course.is_enrolled && progress && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Course Progress</span>
                <span>{progress.progress_percentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress_percentage || 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {course.is_enrolled ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Lessons Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Student Progress */}
              <StudentProgress
                courseId={courseId}
                completedLessons={completedLessons}
                totalLessons={course.lessons?.length || 0}
                onLessonRecommendation={handleLessonSelect}
              />
              
              {/* Lessons List */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-900">Course Lessons</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {course.lessons?.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isSelected = selectedLesson?.id === lesson.id;
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-indigo-50 border-indigo-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">
                                {lesson.order_index + 1}.
                              </span>
                              <span className={`font-medium ${
                                isSelected ? 'text-indigo-900' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </span>
                            </div>
                          </div>
                          {isCompleted && (
                            <svg className="w-5 h-5 text-green-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="lg:col-span-3">
              {selectedLesson ? (
                <div className="space-y-6">
                  <LessonView
                    lesson={selectedLesson}
                    onComplete={handleLessonComplete}
                    isCompleted={completedLessons.includes(selectedLesson.id)}
                    assignments={selectedLesson.assignments || []}
                  />
                  
                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        const prevLesson = getPreviousLesson();
                        if (prevLesson) {handleLessonSelect(prevLesson);}
                      }}
                      disabled={!getPreviousLesson()}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous Lesson
                    </button>
                    
                    <button
                      onClick={() => {
                        const nextLesson = getNextLesson();
                        if (nextLesson) {handleLessonSelect(nextLesson);}
                      }}
                      disabled={!getNextLesson()}
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Next Lesson
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">Select a lesson to begin learning</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enroll to Access Course Content</h2>
            <p className="text-gray-600 mb-6">
              You need to enroll in this course to access lessons and assignments.
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CourseDetail;