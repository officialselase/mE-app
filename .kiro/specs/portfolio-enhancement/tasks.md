# Implementation Plan

- [x] 1. Set up backend API foundation
  - Create Express.js server with JavaScript configuration
  - Set up PostgreSQL database connection with connection pooling
  - Implement environment variable management with dotenv
  - Create base API structure with error handling middleware
  - Set up CORS configuration for frontend communication
  - Create basic project structure (routes, controllers, models, middleware folders)
  - _Requirements: 4.1, 4.2, 4.3, 8.3_

- [x] 2. Implement authentication system




  - [x] 2.1 Create user database schema and models


    - Write User model with email, passwordHash, displayName, role fields
    - Create database migration for users table
    - Add indexes on email field for query optimization
    - _Requirements: 11.3, 11.12_

  - [x] 2.2 Build authentication API endpoints


    - Implement POST /api/auth/register with password hashing using bcrypt
    - Implement POST /api/auth/login with JWT token generation
    - Implement POST /api/auth/logout with token invalidation
    - Implement GET /api/auth/me for session verification
    - Add input validation middleware for auth endpoints
    - _Requirements: 11.4, 11.9, 11.10, 14.1, 14.5_

  - [x] 2.3 Create JWT token management


    - Implement JWT token generation with 15-minute expiration
    - Implement refresh token generation with 7-day expiration
    - Create token verification middleware
    - Implement token refresh endpoint
    - _Requirements: 11.9, 14.2, 14.7_

  - [x] 2.4 Write authentication unit tests






    - Test user registration with valid/invalid inputs
    - Test login with correct/incorrect credentials
    - Test JWT token generation and verification
    - Test password hashing
    - _Requirements: 11.4, 11.8_

- [x] 3. Build frontend authentication context and components






  - [x] 3.1 Create AuthContext with React Context API

    - Create src/context folder
    - Create AuthContext.jsx with AuthProvider component
    - Implement user state management (user, isAuthenticated, isLoading)
    - Create login, register, logout functions that call backend API
    - Implement token storage in localStorage (httpOnly cookies require backend setup)
    - Add automatic token refresh logic
    - _Requirements: 11.9, 11.13, 14.2_


  - [x] 3.2 Build animated bear login component

    - Create src/components/AnimatedBear.jsx component
    - Create SVG or canvas-based bear character
    - Implement eye-covering animation when password field is focused
    - Implement eye-following animation for email field
    - Add happy/sad expressions for success/failure states
    - Ensure animations respect prefers-reduced-motion media query
    - _Requirements: 11.5, 11.6, 11.7, 11.8, 11.15, 9.4_

  - [x] 3.3 Create login and registration pages


    - Create src/pages/Login.jsx with email and password fields
    - Create src/pages/Register.jsx with email, password, displayName fields
    - Integrate AnimatedBear component into both pages
    - Implement client-side validation (email format, password min 8 chars)
    - Add loading states during authentication
    - Display error messages with proper accessibility (aria-live regions)
    - _Requirements: 11.3, 11.4, 11.8, 16.4, 2.5_


  - [x] 3.4 Implement ProtectedRoute component

    - Create src/components/ProtectedRoute.jsx wrapper component
    - Check authentication status from AuthContext
    - Redirect unauthenticated users to login with return URL
    - Redirect authenticated users away from login/register pages
    - _Requirements: 11.1, 11.2, 11.11, 11.14_


  - [x] 3.5 Update App.jsx to use AuthContext and protected routes

    - Wrap App with AuthProvider
    - Add routes for /login and /register
    - Wrap /learn and /projects-repo routes with ProtectedRoute
    - Update navigation to show login/logout based on auth state
    - _Requirements: 11.1, 11.2, 11.14_

  - [x] 3.6 Write authentication component tests










    - Test AuthContext state management
    - Test login/register form validation
    - Test ProtectedRoute redirect logic
    - Test bear animation states
    - _Requirements: 11.4, 11.8_

- [x] 4. Create content management backend API



  - [x] 4.1 Design and create database schemas
    - Create projects table with title, description, images, technologies, featured fields
    - Create thoughts table with title, snippet, content, date, featured, tags fields
    - Create work_experience table with company, position, description, dates fields
    - Add database migrations for all content tables
    - _Requirements: 15.1, 15.2, 15.3_


  - [x] 4.2 Implement projects API endpoints

    - Create GET /api/projects with pagination and featured filter
    - Create GET /api/projects/:id for single project
    - Create POST /api/projects for admin content creation
    - Create PUT /api/projects/:id for admin updates
    - Create DELETE /api/projects/:id for admin deletion
    - _Requirements: 15.1, 15.8, 15.9, 15.10_


  - [x] 4.3 Implement thoughts API endpoints

    - Create GET /api/thoughts with pagination and featured filter
    - Create GET /api/thoughts/:id for single thought
    - Create POST /api/thoughts for admin content creation
    - Create PUT /api/thoughts/:id for admin updates
    - Create DELETE /api/thoughts/:id for admin deletion
    - _Requirements: 15.3, 15.8, 15.9, 15.10_


  - [x] 4.4 Implement work experience API endpoints

    - Create GET /api/work to fetch all work experience
    - Create POST /api/work for admin content creation
    - Create PUT /api/work/:id for admin updates
    - Create DELETE /api/work/:id for admin deletion
    - _Requirements: 15.2, 15.8, 15.9, 15.10_

  - [x] 4.5 Write content API unit tests





    - Test CRUD operations for projects
    - Test CRUD operations for thoughts
    - Test CRUD operations for work experience
    - Test pagination logic
    - Test featured content filtering
    - _Requirements: 15.1, 15.2, 15.3, 15.12_

- [x] 5. Build frontend content fetching and display





  - [x] 5.1 Install and configure axios


    - Add axios to package.json dependencies
    - Create src/utils folder for utilities
    - _Requirements: 4.3, 15.11_

  - [x] 5.2 Create API client utility


    - Build axios-based API client with base URL configuration in src/utils/api.js
    - Implement request interceptor for authentication tokens
    - Implement response interceptor for error handling
    - Add retry logic for failed requests
    - _Requirements: 4.3, 7.2, 15.11_

  - [x] 5.3 Create custom hooks for data fetching


    - Create src/hooks folder
    - Implement useProjects hook with loading and error states
    - Implement useThoughts hook with loading and error states
    - Implement useWorkExperience hook with loading and error states
    - Add caching logic to prevent unnecessary refetches
    - _Requirements: 4.3, 4.4, 15.11_

  - [x] 5.4 Update Home page to fetch latest content


    - Replace hardcoded projects with API call for latest 8 projects using useProjects hook
    - Replace hardcoded thoughts with API call for latest 7 thoughts using useThoughts hook
    - Implement skeleton loaders during data fetch
    - Add error handling with retry button
    - _Requirements: 15.4, 15.5, 15.6, 15.7, 5.3, 7.2_

  - [x] 5.5 Update Projects page to fetch all projects


    - Fetch all projects from API with pagination
    - Implement infinite scroll or "Load More" button
    - Add skeleton loaders for loading states
    - Handle empty state when no projects exist
    - _Requirements: 15.1, 15.12, 5.3_

  - [x] 5.6 Update Thoughts page to fetch all thoughts


    - Fetch all thoughts from API with pagination
    - Implement pagination controls
    - Add skeleton loaders for loading states
    - Handle empty state when no thoughts exist
    - _Requirements: 15.3, 15.12, 5.3_

  - [x] 5.7 Update Work page to fetch work experience


    - Fetch work experience from API
    - Display in chronological order
    - Add skeleton loaders for loading states
    - _Requirements: 15.2, 5.3_

  - [x] 5.8 Write content display component tests





    - Test data fetching hooks
    - Test loading states
    - Test error states
    - Test empty states
    - _Requirements: 5.3, 7.2_

- [x] 6. Implement learn platform backend








  - [x] 6.1 Create learn platform database schemas


    - Create courses table with title, description, instructor fields
    - Create lessons table with courseId, title, content, videoUrl, order fields
    - Create assignments table with lessonId, title, description, type, dueDate fields
    - Create enrollments table with userId, courseId, completedLessons array
    - Create submissions table with assignmentId, studentId, githubRepoUrl, livePreviewUrl, notes, isPublic fields
    - Create submission_comments table with submissionId, userId, content fields
    - Add database migrations for all learn platform tables
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 6.2 Build courses and lessons API endpoints


    - Create GET /api/courses for authenticated users
    - Create GET /api/courses/:id with lessons and assignments
    - Create POST /api/courses/:id/enroll for student enrollment
    - Create PUT /api/lessons/:id/complete for progress tracking
    - Create GET /api/courses/:id/progress for student progress
    - _Requirements: 13.2, 13.9_

  - [x] 6.3 Build assignments and submissions API endpoints





    - Create GET /api/assignments/:id for assignment details
    - Create POST /api/assignments/:id/submit for student submissions
    - Create PUT /api/submissions/:id for editing own submissions
    - Create DELETE /api/submissions/:id for deleting own submissions
    - Create GET /api/assignments/:id/submissions for public submissions
    - Create GET /api/submissions/my-submissions for student's own submissions
    - _Requirements: 13.4, 13.5, 13.6, 13.7, 13.10, 13.11_

  - [x] 6.4 Build submission comments API endpoints





    - Create POST /api/submissions/:id/comments for adding comments
    - Create GET /api/submissions/:id/comments for fetching comments
    - Implement comment validation and sanitization
    - _Requirements: 13.8_


  - [x] 6.5 Write learn platform API unit tests














    - Test course enrollment logic
    - Test lesson completion tracking
    - Test submission CRUD operations
    - Test public/private submission visibility
    - Test comment functionality
    - _Requirements: 13.2, 13.4, 13.9_

- [x] 7. Build learn platform frontend components





  - [x] 7.1 Update Learn page with course listing





    - Refactor existing Learn.jsx to fetch courses from backend API
    - Display available courses with enrollment status
    - Implement course enrollment button
    - Show enrolled courses with progress indicators
    - Keep existing registration form section
    - _Requirements: 13.1, 13.2_

  - [x] 7.2 Create lesson viewer component


    - Create src/components/LessonView.jsx component
    - Display lesson content with proper formatting
    - Integrate existing VideoPlayer component if videoUrl exists
    - Implement "Mark as Complete" button
    - Show associated assignments for the lesson
    - Track and display lesson completion status
    - _Requirements: 13.3, 13.9_

  - [x] 7.3 Create course detail page


    - Create src/pages/CourseDetail.jsx page
    - Display course information and lesson list
    - Integrate LessonView component
    - Add navigation between lessons
    - Show course progress
    - _Requirements: 13.2, 13.3, 13.9_

  - [x] 7.4 Create assignment submission form component


    - Create src/components/AssignmentSubmissionForm.jsx
    - Add fields for GitHub URL, live preview URL, notes
    - Add "Make submission public" checkbox
    - Implement URL validation for GitHub and preview links
    - Show existing submission data for editing
    - Add loading state during submission
    - _Requirements: 13.4, 13.5, 13.11, 16.4_

  - [x] 7.5 Build submissions list component


    - Create src/components/SubmissionsList.jsx
    - Display public submissions from all students
    - Show GitHub repo links and live preview links as clickable buttons
    - Highlight current user's submission
    - Implement comment section for each submission
    - Add "No submissions yet" empty state
    - _Requirements: 13.6, 13.7, 13.8, 13.13_

  - [x] 7.6 Update ProjectsRepo page for assignment tracking


    - Refactor existing ProjectsRepo.jsx to fetch assignments from backend
    - Display all assignments with submission status
    - Show "Submit" button for unsubmitted assignments
    - Show "Edit" button for submitted assignments
    - Add due date indicators
    - Integrate AssignmentSubmissionForm component
    - Integrate SubmissionsList component for viewing others' work
    - _Requirements: 13.10, 13.12_

  - [x] 7.7 Create student progress component


    - Create src/components/StudentProgress.jsx
    - Show completed lessons count
    - Display progress bar for course completion
    - Show next lesson recommendation
    - _Requirements: 13.9_

  - [x] 7.8 Write learn platform component tests








    - Test course enrollment flow
    - Test lesson completion
    - Test submission form validation
    - Test submissions list display
    - Test comment functionality
    - _Requirements: 13.2, 13.4, 13.8_

- [x] 8. Enhance UI/UX with accessibility and polish





  - [x] 8.1 Implement skeleton loaders


    - Create src/components/SkeletonLoader.jsx with card, list, text variants
    - Add skeleton loaders to Home page for projects and thoughts
    - Add skeleton loaders to Projects, Thoughts, and Work pages
    - Ensure skeletons match actual content layout
    - _Requirements: 5.3_

  - [x] 8.2 Build toast notification system


    - Create src/components/Toast.jsx with success, error, info, warning variants
    - Create src/context/ToastContext.jsx for global toast management
    - Add auto-dismiss after 5 seconds
    - Ensure toasts are accessible with aria-live regions
    - Update Shop page to use toast instead of inline message
    - _Requirements: 5.4, 2.2_

  - [x] 8.3 Add page transition animations


    - Create src/components/AnimatedPageTransition.jsx wrapper
    - Add fade transitions between route changes in App.jsx
    - Ensure animations respect prefers-reduced-motion media query
    - Keep transitions under 300ms for performance
    - _Requirements: 5.2, 9.1, 9.4, 9.6_

  - [x] 8.4 Enhance PageHeader with accessibility


    - Update PageHeader.jsx to add visible focus indicators (2px outline)
    - Ensure keyboard navigation works properly
    - Add aria-current attribute for active page
    - Verify color contrast meets WCAG AA standards
    - Add aria-label to Ghana flag icon button
    - _Requirements: 2.1, 2.2, 2.3, 5.7_

  - [x] 8.5 Add micro-interactions to interactive elements


    - Update button and link styles in index.css for hover effects
    - Add scale and color transitions (under 200ms)
    - Add active states for button clicks
    - Ensure all transitions use CSS transforms for performance
    - Apply to project cards, thought cards, and navigation items
    - _Requirements: 5.1, 9.2, 9.6_

  - [x] 8.6 Implement error boundaries


    - Create src/components/ErrorBoundary.jsx with fallback UI
    - Wrap Routes in App.jsx with ErrorBoundary
    - Add "Try Again" button in fallback UI
    - Log errors to console
    - _Requirements: 7.1_

  - [x] 8.7 Build comprehensive error handling UI


    - Create src/components/ErrorMessage.jsx for API failures
    - Add retry buttons for failed requests in data fetching hooks
    - Create src/components/OfflineDetector.jsx for offline messaging
    - Add fallback images for failed image loads
    - _Requirements: 7.2, 7.5, 7.6_

  - [x] 8.8 Write accessibility tests







    - Test keyboard navigation flows
    - Test focus management
    - Test screen reader announcements
    - Test color contrast ratios
    - Run automated accessibility tests with jest-axe
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 9. Optimize performance





  - [x] 9.1 Implement code splitting


    - Update App.jsx to use React.lazy() for route components
    - Wrap lazy components in Suspense with SkeletonLoader fallback
    - Split Projects, Shop, Learn, Work, Thoughts pages into separate chunks
    - _Requirements: 1.5_

  - [x] 9.2 Optimize images


    - Audit all images in public folder
    - Convert large images to WebP format with fallbacks
    - Implement lazy loading with loading="lazy" attribute
    - Add responsive images with srcset where appropriate
    - Compress images before deployment
    - _Requirements: 1.3_

  - [x] 9.3 Optimize fonts


    - Update index.css to add font-display: swap to font declarations
    - Add preload links for critical fonts in index.html
    - Consider subsetting fonts to include only needed characters
    - _Requirements: 1.6_

  - [x] 9.4 Implement React performance optimizations


    - Create memoized ProjectCard and ThoughtCard components
    - Add React.memo() to expensive components
    - Use useCallback for event handlers in Home, Learn, ProjectsRepo
    - Use useMemo for filtered/computed data
    - Optimize re-renders with proper dependency arrays
    - _Requirements: 4.5, 4.6_

  - [x] 9.5 Add caching strategies


    - Install and configure React Query or SWR
    - Update data fetching hooks to use caching library
    - Implement stale-while-revalidate pattern
    - Configure cache times for different data types
    - _Requirements: 1.2_

  - [x] 9.6 Run performance audits













    - Run Lighthouse audits on all pages
    - Ensure performance score 90+ on mobile and desktop
    - Measure and optimize First Contentful Paint
    - Test with throttled network and CPU
    - _Requirements: 1.1, 1.4_

- [x] 10. Implement SEO and meta tags




  - [x] 10.1 Install react-helmet-async for meta tag management


    - Add react-helmet-async to package.json
    - Wrap App with HelmetProvider in main.jsx
    - _Requirements: 6.1, 6.2_

  - [x] 10.2 Add dynamic meta tags to pages


    - Create src/components/MetaTags.jsx component
    - Add unique meta tags to Home, About, Projects, Work, Thoughts, Shop, Learn pages
    - Include title, description, OG tags, and Twitter Card tags
    - Implement dynamic meta tags for individual content items
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 10.3 Implement structured data


    - Add JSON-LD structured data for Person schema in About page
    - Add structured data for portfolio projects in Projects page
    - Add structured data for blog posts in Thoughts page
    - _Requirements: 6.6_

  - [x] 10.4 Optimize for search engines


    - Audit all pages for semantic HTML
    - Ensure proper heading hierarchy (h1-h6) across all pages
    - Add descriptive alt text to all images
    - Create public/sitemap.xml
    - Create public/robots.txt
    - _Requirements: 6.3, 6.5, 2.6, 2.7_

- [x] 11. Set up development tooling






  - [x] 11.1 Enhance ESLint configuration


    - Update eslint.config.js to add accessibility rules (eslint-plugin-jsx-a11y)
    - Add React best practices rules
    - Configure ESLint to check for common issues
    - _Requirements: 8.1, 8.2_

  - [x] 11.2 Add Prettier for code formatting





    - Install Prettier
    - Create .prettierrc configuration file
    - Add format script to package.json
    - Configure Prettier to work with ESLint
    - _Requirements: 8.1, 8.2_

  - [x] 11.3 Create environment configuration documentation


    - Create .env.example with all required variables
    - Update README.md to document environment variables
    - Add instructions for dev/staging/production setup
    - Document backend API URL configuration
    - _Requirements: 8.3_

  - [x] 11.4 Add bundle analysis


    - Install rollup-plugin-visualizer for Vite
    - Configure bundle analysis in vite.config.js
    - Add analyze script to package.json
    - _Requirements: 8.4_

- [x] 12. Prepare shop backend infrastructure (not activated on frontend)





  - [x] 12.1 Create shop database schemas


    - Create products table with title, description, price, images, stock, featured fields
    - Create carts table with userId and items array
    - Create orders table with userId, items, total, status, shipping address fields
    - Add database migrations for shop tables
    - _Requirements: 12.4 (future)_

  - [x] 12.2 Build shop API endpoints (backend only, not connected to frontend)


    - Create GET /api/products with pagination and featured filter
    - Create POST /api/cart/items for adding to cart
    - Create POST /api/orders for order creation
    - Implement Stripe payment intent creation endpoint
    - Note: These endpoints will not be used by frontend until shop launches
    - _Requirements: 12.4 (future)_

  - [x] 12.3 Integrate Stripe SDK (backend only)



    - Install and configure Stripe SDK on backend
    - Implement payment intent creation
    - Set up webhook endpoint for payment confirmation
    - Test with Stripe test mode
    - Note: Frontend will continue showing "Coming Soon" page
    - _Requirements: 17.2, 17.3 (future)_

- [ ] 13. Final integration and testing
  - [x] 13.1 Manual end-to-end testing of authentication flow




    - Test registration → login → protected route access manually
    - Test logout and session expiration
    - Test redirect to login for unauthenticated access to /learn and /projects-repo
    - Test bear animations during login/register
    - _Requirements: 11.1, 11.2, 11.9, 11.10, 11.14_

  - [x] 13.2 Manual end-to-end testing of learn platform


    - Test course enrollment → lesson viewing → assignment submission
    - Test viewing other students' submissions
    - Test commenting on submissions
    - Test progress tracking
    - _Requirements: 13.1, 13.2, 13.4, 13.8, 13.9_

  - [x] 13.3 Manual end-to-end testing of content management
    - Test fetching and displaying projects on Home and Projects pages
    - Test fetching and displaying thoughts on Home and Thoughts pages
    - Test fetching and displaying work experience on Work page
    - Test loading states and error handling
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 13.4 Cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge
    - Test on mobile browsers (iOS Safari, Chrome Android)
    - Fix any browser-specific issues
    - Test responsive design at various breakpoints
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 13.5 Accessibility audit
    - Run automated accessibility tests using Lighthouse
    - Manual keyboard navigation testing on all pages
    - Test screen reader compatibility (if available)
    - Fix all WCAG AA violations
    - Verify focus indicators are visible
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 13.6 Performance optimization final pass
    - Run Lighthouse on all pages
    - Optimize any pages below 90 performance score
    - Verify Core Web Vitals meet targets
    - Test with throttled network
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 13.7 Security audit
    - Review authentication implementation
    - Test for XSS vulnerabilities in user inputs
    - Verify HTTPS enforcement in production
    - Test rate limiting on backend API
    - Review CORS configuration
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.8_

- [ ] 14. Deployment and monitoring
  - [ ] 14.1 Set up production database
    - Choose and configure production PostgreSQL database (Supabase/Railway/Render)
    - Run database migrations in production
    - Set up database backups
    - Configure connection pooling
    - _Requirements: 14.1_

  - [ ] 14.2 Deploy backend API
    - Choose hosting platform (Railway/Render/Heroku)
    - Configure deployment settings
    - Set up environment variables in hosting platform
    - Deploy backend application
    - Test API endpoints in production
    - _Requirements: 8.3_

  - [ ] 14.3 Update frontend for production
    - Update .env with production API URL
    - Build production bundle with npm run build
    - Test production build locally with npm run preview
    - _Requirements: 1.4_

  - [ ] 14.4 Deploy frontend application
    - Choose hosting platform (Vercel/Netlify)
    - Connect GitHub repository for automatic deployments
    - Configure environment variables in hosting platform
    - Deploy frontend application
    - Test all pages in production
    - Verify API connectivity
    - _Requirements: 1.4_

  - [ ] 14.5 Set up basic monitoring
    - Configure error tracking (optional: Sentry)
    - Set up uptime monitoring (optional: UptimeRobot)
    - Add basic analytics (optional: Google Analytics)
    - Monitor backend logs
    - _Requirements: 7.1_

  - [ ] 14.6 Create documentation
    - Update README.md with project overview
    - Document API endpoints in backend
    - Create deployment guide
    - Document all environment variables
    - Add setup instructions for local development
    - _Requirements: 8.2_
