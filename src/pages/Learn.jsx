// src/pages/Learn.jsx
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import CoursesList from "../components/CoursesList";
import useCourses from "../hooks/useCourses";
import { useAuth } from "../context/AuthContext";
import OptimizedImage from "../components/OptimizedImage";
import MetaTags from "../components/MetaTags";
import "../styles/GamePlayground.css";

export const learnSummary = `
The Learn page is an educational space where Selase shares resources,
insights, and tutorials. It is focused on mentorship, coding guidance,
and knowledge-sharing to help others grow in tech.
`;

const Learn = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { courses, enrollments, loading, error, enrollInCourse, isEnrolling, enrollError, retry } = useCourses({ enabled: isAuthenticated });

  const [formData, setFormData] = useState({
    student_name: "",
    age_group: "",
    experience_level: "beginner",
    contact_email: "",
    contact_phone: "",
    parent_guardian_name: "",
    course_type: "",
    service_type: "",
    preferred_schedule: "",
    learning_goals: "",
    additional_notes: "",
    has_computer: true,
  });
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [localEnrollmentError, setLocalEnrollmentError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [validationErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.student_name.trim()) {
      errors.student_name = "Student name is required";
    }
    
    if (!formData.age_group) {
      errors.age_group = "Please select an age group";
    }
    
    if (!formData.contact_email.trim()) {
      errors.contact_email = "Email is required";
    }
    
    if (!formData.course_type) {
      errors.course_type = "Please select a course type";
    }
    
    if (!formData.service_type) {
      errors.service_type = "Please select a service type";
    }
    
    // Require parent/guardian name for kids and teenagers
    if (['kids', 'teenagers'].includes(formData.age_group) && !formData.parent_guardian_name.trim()) {
      errors.parent_guardian_name = "Parent/Guardian name is required for kids and teenagers";
    }
    
    return errors;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setValidationErrors({});
      
      const { learnAPI } = await import('../utils/djangoApi');
      await learnAPI.submitInquiry(formData);
      
      setIsPopupOpen(true);
      setTimeout(() => setIsPopupOpen(false), 4000);

      // Reset form
      setFormData({
        student_name: "",
        age_group: "",
        experience_level: "beginner",
        contact_email: "",
        contact_phone: "",
        parent_guardian_name: "",
        course_type: "",
        service_type: "",
        preferred_schedule: "",
        learning_goals: "",
        additional_notes: "",
        has_computer: true,
      });
      
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      if (error.response?.data?.details) {
        setValidationErrors(error.response.data.details);
      } else {
        setSubmitError(error.response?.data?.error || error.message || 'Failed to submit inquiry');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  const handleEnrollInCourse = useCallback(async (courseId) => {
    try {
      setLocalEnrollmentError(null);
      await enrollInCourse(courseId);
    } catch (error) {
      setLocalEnrollmentError(error.message);
      setTimeout(() => setLocalEnrollmentError(null), 5000);
    }
  }, [enrollInCourse]);

  const getFieldError = (fieldName) => {
    return validationErrors[fieldName];
  };

  const sections = useMemo(
    () => [
      // Hero
      {
        id: "hero",
        content: (
          <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 text-center">
            <div className="max-w-4xl mx-auto px-6">
              <OptimizedImage
                src="https://cdn.dribbble.com/userupload/20477400/file/original-c84e51367767f2a7c485a43d820bde27.gif"
                alt="Learning Animation"
                className="w-full max-h-96 object-contain mx-auto mb-10"
                lazy={false}
              />
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                Learn, Grow, Build Your Future
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                From block-based programming for kids to advanced web development for adults. 
                Personalized learning paths, expert mentoring, and hands-on projects that matter.
              </p>
            </div>
          </section>
        ),
      },
      
      // Programs Overview
      {
        id: "programs",
        content: (
          <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Learning Programs for Every Age
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Tailored educational experiences designed to meet learners where they are
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Kids Program */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-4">🧒</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Kids (6-12 years)</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• Scratch Programming (Block-based)</li>
                    <li>• Creative Problem Solving</li>
                    <li>• Game Design Basics</li>
                    <li>• Digital Storytelling</li>
                  </ul>
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">
                      Fun, interactive learning that builds computational thinking through play
                    </p>
                  </div>
                </div>

                {/* Teenagers Program */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-4">🧑‍🎓</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Teenagers (13-17 years)</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• Web Development Basics</li>
                    <li>• Python Programming</li>
                    <li>• JavaScript Fundamentals</li>
                    <li>• Mobile App Development</li>
                  </ul>
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">
                      Real-world skills preparation for college and career readiness
                    </p>
                  </div>
                </div>

                {/* Adults Program */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-4">👩‍💼</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Adults (18+ years)</h3>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li>• Full Stack Development</li>
                    <li>• React & Django</li>
                    <li>• Career Transition Support</li>
                    <li>• Professional Mentoring</li>
                  </ul>
                  <div className="mt-6 p-4 bg-white rounded-lg">
                    <p className="text-sm text-gray-600">
                      Intensive programs designed for career advancement and skill development
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ),
      },

      // Service Types
      {
        id: "services",
        content: (
          <section className="bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Choose Your Learning Style
                </h2>
                <p className="text-lg text-gray-600">
                  Flexible options to fit your schedule and learning preferences
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4 text-center">👥</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Group Classes</h3>
                  <p className="text-gray-600 text-sm">
                    Learn with peers in structured, interactive sessions
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4 text-center">👨‍🏫</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Private Tutoring</h3>
                  <p className="text-gray-600 text-sm">
                    One-on-one personalized instruction at your pace
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4 text-center">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Mentoring</h3>
                  <p className="text-gray-600 text-sm">
                    Career guidance and long-term skill development
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-4 text-center">⚡</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Workshops</h3>
                  <p className="text-gray-600 text-sm">
                    Intensive sessions on specific topics and skills
                  </p>
                </div>
              </div>
            </div>
          </section>
        ),
      },

      // Video Demo
      {
        id: "video-demo",
        content: (
          <section className="bg-white py-20">
            <div className="max-w-4xl mx-auto text-center px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                See Our Teaching Approach
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Interactive, project-based learning that builds real skills
              </p>
              <VideoPlayer videoUrl="https://youtu.be/TBdZsbNG8Z0?si=C0XGbGCjqFmPy8Js" />
            </div>
          </section>
        ),
      },

      // Courses Section (only show if authenticated)
      ...(isAuthenticated ? [{
        id: "courses",
        content: (
          <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Available Courses
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Explore our comprehensive courses designed to take you from beginner to professional. 
                  Each course includes hands-on projects, assignments, and community interaction.
                </p>
              </div>
              
              {(localEnrollmentError || enrollError) && (
                <div className="mb-6 max-w-md mx-auto">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-800 text-sm">{localEnrollmentError || enrollError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <CoursesList
                courses={courses}
                enrollments={enrollments}
                loading={loading}
                error={error}
                onEnroll={handleEnrollInCourse}
                onRetry={retry}
                isEnrolling={isEnrolling}
              />
            </div>
          </section>
        ),
      }] : []),

      // Enhanced Registration Form
      {
        id: "registration-form",
        content: (
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Start Your Learning Journey
                </h2>
                <p className="text-xl text-blue-100">
                  Tell us about yourself and we'll create the perfect learning path
                </p>
              </div>
              
              {submitError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-2xl mx-auto">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {submitError}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="student_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name *
                    </label>
                    <input
                      id="student_name"
                      name="student_name"
                      value={formData.student_name}
                      onChange={handleChange}
                      placeholder="Enter student's full name"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('student_name') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {getFieldError('student_name') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('student_name')}</p>
                    )}
                  </div>

                  {/* Age Group */}
                  <div>
                    <label htmlFor="age_group" className="block text-sm font-medium text-gray-700 mb-2">
                      Age Group *
                    </label>
                    <select
                      id="age_group"
                      name="age_group"
                      value={formData.age_group}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('age_group') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select age group</option>
                      <option value="kids">Kids (6-12 years)</option>
                      <option value="teenagers">Teenagers (13-17 years)</option>
                      <option value="adults">Adults (18+ years)</option>
                    </select>
                    {getFieldError('age_group') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('age_group')}</p>
                    )}
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      id="experience_level"
                      name="experience_level"
                      value={formData.experience_level}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">Complete Beginner</option>
                      <option value="some_experience">Some Experience</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('contact_email') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {getFieldError('contact_email') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('contact_email')}</p>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="contact_phone"
                      name="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={handleChange}
                      placeholder="+233 XX XXX XXXX"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Parent/Guardian Name (conditional) */}
                  {['kids', 'teenagers'].includes(formData.age_group) && (
                    <div className="md:col-span-2">
                      <label htmlFor="parent_guardian_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Parent/Guardian Name *
                      </label>
                      <input
                        id="parent_guardian_name"
                        name="parent_guardian_name"
                        value={formData.parent_guardian_name}
                        onChange={handleChange}
                        placeholder="Parent or guardian's full name"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          getFieldError('parent_guardian_name') ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {getFieldError('parent_guardian_name') && (
                        <p className="text-red-500 text-sm mt-1">{getFieldError('parent_guardian_name')}</p>
                      )}
                    </div>
                  )}

                  {/* Course Type */}
                  <div>
                    <label htmlFor="course_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Interest *
                    </label>
                    <select
                      id="course_type"
                      name="course_type"
                      value={formData.course_type}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('course_type') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select a course</option>
                      <option value="scratch">Scratch Programming (Block-based)</option>
                      <option value="web_basics">Web Development Basics</option>
                      <option value="react_frontend">React Frontend Development</option>
                      <option value="django_backend">Django Backend Development</option>
                      <option value="full_stack">Full Stack Development</option>
                      <option value="mobile_flutter">Mobile Development with Flutter</option>
                      <option value="python_basics">Python Programming Basics</option>
                      <option value="javascript_basics">JavaScript Programming Basics</option>
                    </select>
                    {getFieldError('course_type') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('course_type')}</p>
                    )}
                  </div>

                  {/* Service Type */}
                  <div>
                    <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Format *
                    </label>
                    <select
                      id="service_type"
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        getFieldError('service_type') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select format</option>
                      <option value="group_class">Group Classes</option>
                      <option value="private_tutoring">Private Tutoring</option>
                      <option value="mentoring">Mentoring Sessions</option>
                      <option value="workshop">One-time Workshop</option>
                    </select>
                    {getFieldError('service_type') && (
                      <p className="text-red-500 text-sm mt-1">{getFieldError('service_type')}</p>
                    )}
                  </div>

                  {/* Preferred Schedule */}
                  <div className="md:col-span-2">
                    <label htmlFor="preferred_schedule" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Schedule
                    </label>
                    <input
                      id="preferred_schedule"
                      name="preferred_schedule"
                      value={formData.preferred_schedule}
                      onChange={handleChange}
                      placeholder="e.g., Weekends, Evenings, Flexible"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Learning Goals */}
                  <div className="md:col-span-2">
                    <label htmlFor="learning_goals" className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Goals
                    </label>
                    <textarea
                      id="learning_goals"
                      name="learning_goals"
                      value={formData.learning_goals}
                      onChange={handleChange}
                      placeholder="What do you hope to achieve? Any specific projects or career goals?"
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Has Computer */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3">
                      <input
                        name="has_computer"
                        type="checkbox"
                        checked={formData.has_computer}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        I have access to a computer/laptop for learning
                      </span>
                    </label>
                  </div>

                  {/* Additional Notes */}
                  <div className="md:col-span-2">
                    <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      id="additional_notes"
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleChange}
                      placeholder="Any other information you'd like to share?"
                      rows="2"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Start My Learning Journey'}
                </button>
              </form>

              {/* Contact Information */}
              <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-blue-100 mb-6">
                  Let's discuss the perfect learning path for you or your child
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href="tel:+233555964195"
                    className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <span>📞</span>
                    <span>+233 55 596 4195</span>
                  </a>
                  <a
                    href="https://wa.me/233555964195"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </a>
                </div>
                <p className="text-sm text-blue-200 mt-4">
                  <strong>Selase K. Agbai</strong> - Senior Developer at Fiberwave Ghana LTD
                </p>
              </div>

              {/* Success Popup */}
              {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md text-center mx-4">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Thank You!
                    </h3>
                    <p className="text-gray-700 mb-6">
                      Your inquiry has been received! We'll contact you within 24 hours to discuss your learning journey.
                    </p>
                    <button
                      onClick={() => setIsPopupOpen(false)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        ),
      },

      // Projects CTA
      {
        id: "projects-cta",
        content: (
          <section className="bg-white py-20 text-center">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Showcase Your Progress
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Share your projects, get feedback, and connect with other learners in our student community
              </p>
              <button
                onClick={() => navigate("/projects-repo")}
                className="inline-flex items-center space-x-2 px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-500 transition-all duration-200 transform hover:scale-105"
              >
                <span>🚀</span>
                <span>Visit Student Repository</span>
              </button>
            </div>
          </section>
        ),
      },
    ],
    [handleSubmit, handleChange, navigate, isAuthenticated, courses, enrollments, loading, error, handleEnrollInCourse, retry, localEnrollmentError, enrollError, isEnrolling, formData, validationErrors, isSubmitting, submitError, isPopupOpen]
  );

  return (
    <>
      <MetaTags
        title="Learn - Selase Kofi Agbai"
        description="Comprehensive coding education for kids, teenagers, and adults. From Scratch programming to full-stack development. Personalized tutoring, group classes, and mentoring available."
        keywords="learn, coding education, programming courses, Scratch programming, web development, React, Django, kids coding, adult programming, mentoring, tutoring, Selase Kofi Agbai"
        url={`${window.location.origin}/learn`}
      />
      <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans antialiased">
        <main className="flex-grow">
          {sections.map((section) => (
            <div key={section.id}>{section.content}</div>
          ))}
        </main>
      </div>
    </>
  );
};

export default Learn;