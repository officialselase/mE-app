# Backend Unit Tests

This directory contains comprehensive unit tests for the backend API, including authentication and content management systems.

## Test Coverage

### Authentication Tests

#### 1. User Model Tests (`models/User.test.js`)
Tests password hashing, email normalization, and display name validation:

- **Password Hashing with bcrypt**
  - Verifies passwords are hashed using bcrypt with salt rounds of 12
  - Tests password verification with correct and incorrect passwords
  - Ensures different hashes are generated for the same password (salt)
  - Validates bcrypt hash format

- **Email Normalization**
  - Tests email conversion to lowercase
  - Validates whitespace trimming
  - Ensures case-insensitive email handling

- **Display Name Validation**
  - Tests whitespace trimming
  - Validates allowed characters (letters, numbers, spaces, hyphens, underscores)
  - Rejects invalid characters (special symbols)

#### 2. Token Manager Tests (`utils/tokenManager.test.js`)
Tests JWT token generation and verification:

- **Access Token Generation**
  - Validates JWT structure (3 parts: header.payload.signature)
  - Verifies user data inclusion in payload
  - Tests expiration time setting (15 minutes)
  - Ensures unique tokens for same user

- **Refresh Token Generation**
  - Validates JWT structure
  - Verifies user ID, type, and unique token ID (jti) in payload
  - Tests longer expiration (7 days) compared to access tokens

- **Token Verification**
  - Tests verification of valid tokens
  - Validates rejection of invalid tokens
  - Tests rejection of tokens with wrong secret
  - Verifies expired token detection

- **Token Payload Structure**
  - Validates standard JWT claims (iat, exp)
  - Tests token decoding without verification

- **Token Expiration Calculation**
  - Verifies correct expiration for 15-minute access tokens
  - Validates correct expiration for 7-day refresh tokens

#### 3. Auth Controller Tests (`controllers/authController.test.js`)
Tests authentication business logic:

- **User Registration Validation**
  - Email format validation
  - Password requirements (min 8 chars, uppercase, lowercase, number)
  - Display name format validation

- **Password Hashing for Registration**
  - Verifies passwords are hashed before storage
  - Tests password verification
  - Validates rejection of incorrect passwords

- **Login Credential Verification**
  - Tests verification of correct credentials
  - Validates rejection of non-existent users
  - Tests rejection of incorrect passwords

- **Email Normalization**
  - Tests lowercase conversion
  - Validates whitespace trimming
  - Ensures case-insensitive comparison

- **User Role Assignment**
  - Tests default role assignment
  - Validates supported roles (user, student, instructor, admin)

- **Response Structure**
  - Verifies user data excludes password
  - Tests inclusion of tokens in auth response

- **Error Response Structure**
  - Tests duplicate email error (409)
  - Validates invalid credentials error (401)
  - Tests user not found error (404)

#### 4. Validation Middleware Tests (`middleware/validation.test.js`)
Tests input validation for authentication endpoints:

- **Registration Validation**
  - Email format validation
  - Password length (min 8 characters)
  - Password complexity (uppercase, lowercase, number)
  - Display name length (2-100 characters)
  - Display name character restrictions
  - Email normalization
  - Whitespace trimming
  - Multiple validation errors

- **Login Validation**
  - Email format validation
  - Password required validation
  - Missing field validation
  - Email normalization

- **Refresh Token Validation**
  - Refresh token required validation
  - Empty token rejection

### Content Management Tests

#### 5. Projects Controller Tests (`controllers/projectsController.test.js`)
Tests CRUD operations and business logic for projects:

- **Pagination Logic**
  - Validates offset calculation for different page/limit combinations
  - Tests total pages calculation
  - Verifies default pagination values
  - Tests query parameter parsing

- **Featured Content Filtering**
  - Tests featured filter detection from query strings
  - Validates SQL query building for featured/non-featured content
  - Tests count queries with featured filter

- **Data Formatting**
  - Tests JSON parsing for images and technologies arrays
  - Validates handling of null JSON fields
  - Tests boolean conversion for featured flag

- **Validation**
  - Tests required field validation (title, description)
  - Validates error response structure
  - Tests validation error messages

- **JSON Serialization**
  - Tests array stringification for database storage
  - Validates null handling for optional fields
  - Tests boolean to integer conversion

- **Update Logic**
  - Tests preservation of existing values when fields not provided
  - Validates updating multiple fields
  - Tests partial updates

- **Error Handling**
  - Tests 404 responses for non-existent projects
  - Validates 400 responses for validation errors
  - Tests 201 responses for successful creation

- **Response Structure**
  - Validates pagination metadata in list responses
  - Tests formatted project structure
  - Validates success messages for deletion

#### 6. Thoughts Controller Tests (`controllers/thoughtsController.test.js`)
Tests CRUD operations and business logic for thoughts/blog posts:

- **Pagination Logic**
  - Validates offset calculation
  - Tests total pages calculation
  - Verifies default values and query parsing

- **Featured Content Filtering**
  - Tests featured filter detection
  - Validates SQL query building
  - Tests count queries with filters

- **Data Formatting**
  - Tests JSON parsing for tags array
  - Validates handling of null/empty tags
  - Tests boolean conversion for featured flag

- **Validation**
  - Tests required fields (title, snippet, content)
  - Validates detection of missing fields
  - Tests error response structure

- **Date Handling**
  - Tests using provided dates
  - Validates automatic date generation
  - Tests ISO string formatting

- **JSON Serialization**
  - Tests tags array stringification
  - Validates null handling
  - Tests boolean to integer conversion

- **Update Logic**
  - Tests preservation of existing values
  - Validates updating multiple fields
  - Tests partial updates with tags

- **Ordering**
  - Tests ordering by date descending
  - Validates ordering before pagination

- **Error Handling & Response Structure**
  - Tests 404, 400, and 201 responses
  - Validates pagination metadata
  - Tests formatted thought structure

#### 7. Work Experience Controller Tests (`controllers/workController.test.js`)
Tests CRUD operations and business logic for work experience:

- **Data Retrieval**
  - Tests ordering by start_date descending
  - Validates display_order as secondary sort
  - Verifies no pagination (returns all records)

- **Data Formatting**
  - Tests JSON parsing for technologies array
  - Validates handling of null technologies
  - Tests boolean conversion for current flag

- **Validation**
  - Tests all required fields (company, position, description, start_date)
  - Validates detection of each missing field
  - Tests error response structure

- **Date Handling**
  - Tests optional end_date handling
  - Validates current position without end_date
  - Tests past position with end_date

- **JSON Serialization**
  - Tests technologies array stringification
  - Validates null handling
  - Tests boolean to integer conversion

- **Display Order**
  - Tests default display_order value
  - Validates custom display_order
  - Tests handling of display_order = 0

- **Update Logic**
  - Tests preservation of existing values
  - Validates updating multiple fields
  - Tests updating technologies array

- **Chronological Ordering**
  - Tests sorting by most recent first
  - Validates display_order for same start_date

- **Error Handling & Response Structure**
  - Tests 404, 400, and 201 responses
  - Validates array response without pagination
  - Tests formatted work experience structure

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test __tests__/controllers/projectsController.test.js
npm test __tests__/controllers/thoughtsController.test.js
npm test __tests__/controllers/workController.test.js

# Run all content API tests
npm test __tests__/controllers/projectsController.test.js __tests__/controllers/thoughtsController.test.js __tests__/controllers/workController.test.js

# Run all learn platform API tests
npm test __tests__/controllers/coursesController.test.js __tests__/controllers/assignmentsController.test.js

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Requirements Covered

This test suite covers the following requirements from the specification:

### Authentication Requirements
- **Requirement 11.4**: User registration with valid/invalid inputs
- **Requirement 11.8**: Login with correct/incorrect credentials
- **Requirement 11.9**: JWT token generation and verification
- **Requirement 11.12**: Password hashing with bcrypt

### Content Management Requirements
- **Requirement 15.1**: Projects CRUD operations and pagination
- **Requirement 15.2**: Work experience CRUD operations
- **Requirement 15.3**: Thoughts CRUD operations and pagination
- **Requirement 15.12**: Pagination logic and featured content filtering

### Learn Platform Requirements
- **Requirement 13.2**: Course enrollment logic and access control
- **Requirement 13.4**: Assignment submission CRUD operations
- **Requirement 13.9**: Lesson completion tracking and progress calculation
- **Requirement 13.5**: Public/private submission visibility controls
- **Requirement 13.6**: Public submission viewing by enrolled students
- **Requirement 13.7**: Student's own submission highlighting
- **Requirement 13.8**: Comment functionality on submissions
- **Requirement 13.10**: Assignment tracking and submission status
- **Requirement 13.11**: Submission editing capabilities

### Learn Platform Tests

#### 8. Courses Controller Tests (`controllers/coursesController.test.js`)
Tests course enrollment logic, lesson completion tracking, and course management:

- **Course Enrollment Logic**
  - Tests successful course enrollment with empty completed lessons array
  - Validates course existence before enrollment
  - Prevents duplicate enrollment attempts
  - Returns proper error codes (404 for non-existent course, 400 for duplicate enrollment)
  - Verifies enrollment status in course listings
  - Tests course detail access for enrolled users only

- **Lesson Completion Tracking**
  - Tests marking lessons as complete with progress updates
  - Validates lesson existence and user enrollment before completion
  - Prevents duplicate lesson completion entries
  - Handles null completed lessons arrays gracefully
  - Updates last accessed timestamp on completion
  - Calculates completion percentage correctly (including edge cases)
  - Tests progress retrieval for enrolled users

- **Course Management (Admin/Instructor)**
  - Tests course creation with validation
  - Validates required fields (title, description)
  - Tests course updates by instructors and admins
  - Prevents unauthorized course modifications
  - Tests course deletion with proper authorization
  - Returns appropriate error codes for unauthorized access

#### 9. Assignments Controller Tests (`controllers/assignmentsController.test.js`)
Tests assignment submission CRUD operations, public/private visibility, and comment functionality:

- **Assignment Access Control**
  - Tests assignment details retrieval for enrolled users
  - Validates course enrollment before assignment access
  - Returns proper error codes for unauthorized access
  - Includes user's own submission in assignment details

- **Submission CRUD Operations**
  - Tests assignment submission creation with validation
  - Prevents duplicate submissions (requires PUT for updates)
  - Tests submission updates (own submissions only)
  - Tests submission deletion (own submissions only)
  - Validates GitHub and live preview URLs
  - Allows null URLs for submissions without links

- **Public/Private Submission Visibility**
  - Tests creation of private submissions (is_public: false)
  - Tests updating submission privacy settings
  - Ensures only public submissions appear in assignment submission lists
  - Correctly marks user's own submissions (is_mine flag)
  - Prevents access to private submissions from other users
  - Allows access to own private submissions

- **Comment Functionality**
  - Tests commenting on public submissions
  - Prevents commenting on private submissions from other users
  - Allows commenting on own submissions (public or private)
  - Validates comment content (non-empty)
  - Tests comment retrieval with proper access control
  - Includes user enrollment verification for commenting

- **URL Validation**
  - Tests GitHub repository URL validation
  - Tests live preview URL validation
  - Accepts valid HTTPS URLs
  - Rejects invalid URL formats
  - Allows null/undefined URLs

- **Student Submission Management**
  - Tests retrieval of user's own submissions across all courses
  - Includes assignment and course context in submission lists
  - Properly formats boolean fields (is_public)
  - Tests submission filtering and ordering

## Test Statistics

- **Total Test Suites**: 9
- **Total Tests**: 213 (70 auth + 89 content + 54 learn platform)
- **Test Coverage**: 
  - Authentication system (complete)
  - Content management API (complete)
  - Learn platform API (complete)

## Notes

- Tests use Jest as the testing framework
- Supertest is used for HTTP endpoint testing (where applicable)
- bcrypt is tested directly for password hashing
- JWT tokens are tested using the jsonwebtoken library
- Tests are designed to work with ES modules
- Database operations are tested through validation logic rather than mocking
- Content API tests focus on business logic, data formatting, and validation
- All tests are unit tests that verify controller logic without database integration
