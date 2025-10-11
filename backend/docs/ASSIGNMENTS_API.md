# Assignments and Submissions API Documentation

This document describes the API endpoints for managing assignments and submissions in the learning platform.

## Overview

The assignments and submissions system allows students to:
- View assignment details
- Submit their work (GitHub repos, live previews, notes)
- Update and delete their own submissions
- View other students' public submissions
- Comment on submissions

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Assignment Details

**GET** `/api/assignments/:id`

Get detailed information about a specific assignment.

#### Parameters
- `id` (path) - Assignment ID

#### Response
```json
{
  "id": "assignment123",
  "title": "Build a Todo App",
  "description": "Create a full-stack todo application",
  "instructions": "Use React for frontend and Node.js for backend",
  "type": "project",
  "due_date": "2024-12-31T23:59:59Z",
  "required": true,
  "lesson_title": "Full Stack Development",
  "course_title": "Web Development Bootcamp",
  "my_submission": {
    "id": "submission456",
    "github_repo_url": "https://github.com/user/todo-app",
    "live_preview_url": "https://my-todo-app.netlify.app",
    "notes": "Implemented all required features",
    "is_public": true,
    "submitted_at": "2024-12-15T10:30:00Z"
  }
}
```

#### Error Responses
- `404` - Assignment not found
- `403` - Not enrolled in course

### 2. Submit Assignment

**POST** `/api/assignments/:id/submit`

Submit work for an assignment.

#### Parameters
- `id` (path) - Assignment ID

#### Request Body
```json
{
  "github_repo_url": "https://github.com/user/my-project",
  "live_preview_url": "https://my-project.netlify.app",
  "notes": "Optional notes about the submission",
  "is_public": true
}
```

#### Response
```json
{
  "message": "Assignment submitted successfully",
  "submission": {
    "id": "submission789",
    "assignment_id": "assignment123",
    "student_id": "user456",
    "student_name": "John Doe",
    "github_repo_url": "https://github.com/user/my-project",
    "live_preview_url": "https://my-project.netlify.app",
    "notes": "Optional notes about the submission",
    "is_public": true,
    "submitted_at": "2024-12-15T14:20:00Z"
  }
}
```

#### Error Responses
- `400` - Already submitted (use PUT to update)
- `400` - Invalid URL format
- `403` - Not enrolled in course
- `404` - Assignment not found

### 3. Update Submission

**PUT** `/api/assignments/submissions/:id`

Update your own submission.

#### Parameters
- `id` (path) - Submission ID

#### Request Body
```json
{
  "github_repo_url": "https://github.com/user/updated-project",
  "live_preview_url": "https://updated-project.netlify.app",
  "notes": "Updated with new features",
  "is_public": false
}
```

#### Response
```json
{
  "message": "Submission updated successfully",
  "submission": {
    "id": "submission789",
    "github_repo_url": "https://github.com/user/updated-project",
    "live_preview_url": "https://updated-project.netlify.app",
    "notes": "Updated with new features",
    "is_public": false,
    "updated_at": "2024-12-16T09:15:00Z"
  }
}
```

#### Error Responses
- `403` - Can only update own submissions
- `404` - Submission not found
- `400` - Invalid URL format

### 4. Delete Submission

**DELETE** `/api/assignments/submissions/:id`

Delete your own submission.

#### Parameters
- `id` (path) - Submission ID

#### Response
```json
{
  "message": "Submission deleted successfully"
}
```

#### Error Responses
- `403` - Can only delete own submissions
- `404` - Submission not found

### 5. Get Assignment Submissions

**GET** `/api/assignments/:id/submissions`

Get all public submissions for an assignment.

#### Parameters
- `id` (path) - Assignment ID

#### Response
```json
{
  "assignment_id": "assignment123",
  "assignment_title": "Build a Todo App",
  "submissions": [
    {
      "id": "submission1",
      "student_id": "user1",
      "student_name": "Alice Smith",
      "github_repo_url": "https://github.com/alice/todo-app",
      "live_preview_url": "https://alice-todo.netlify.app",
      "notes": "Clean implementation with tests",
      "is_public": true,
      "is_mine": false,
      "submitted_at": "2024-12-14T16:45:00Z"
    },
    {
      "id": "submission2",
      "student_id": "user2",
      "student_name": "Bob Johnson",
      "github_repo_url": "https://github.com/bob/todo-project",
      "live_preview_url": "https://bob-todo.vercel.app",
      "notes": "Added extra features",
      "is_public": true,
      "is_mine": true,
      "submitted_at": "2024-12-15T10:30:00Z"
    }
  ]
}
```

#### Error Responses
- `403` - Not enrolled in course
- `404` - Assignment not found

### 6. Get My Submissions

**GET** `/api/assignments/submissions/my-submissions`

Get all submissions by the current user.

#### Response
```json
{
  "submissions": [
    {
      "id": "submission1",
      "assignment_id": "assignment123",
      "assignment_title": "Build a Todo App",
      "lesson_title": "Full Stack Development",
      "course_title": "Web Development Bootcamp",
      "course_id": "course456",
      "github_repo_url": "https://github.com/user/todo-app",
      "live_preview_url": "https://my-todo.netlify.app",
      "notes": "My first full-stack project",
      "is_public": true,
      "due_date": "2024-12-31T23:59:59Z",
      "submitted_at": "2024-12-15T10:30:00Z"
    }
  ]
}
```

### 7. Add Comment to Submission

**POST** `/api/assignments/submissions/:id/comments`

Add a comment to a submission (public submissions or your own).

#### Parameters
- `id` (path) - Submission ID

#### Request Body
```json
{
  "content": "Great work! I love the clean design."
}
```

#### Response
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": "comment123",
    "submission_id": "submission456",
    "user_id": "user789",
    "user_name": "Jane Doe",
    "content": "Great work! I love the clean design.",
    "created_at": "2024-12-16T11:20:00Z"
  }
}
```

#### Error Responses
- `400` - Comment content is required
- `403` - Cannot comment on private submissions
- `403` - Not enrolled in course
- `404` - Submission not found

### 8. Get Submission Comments

**GET** `/api/assignments/submissions/:id/comments`

Get all comments for a submission.

#### Parameters
- `id` (path) - Submission ID

#### Response
```json
{
  "submission_id": "submission456",
  "comments": [
    {
      "id": "comment1",
      "user_id": "user1",
      "user_name": "Alice Smith",
      "content": "Nice implementation!",
      "created_at": "2024-12-15T14:30:00Z"
    },
    {
      "id": "comment2",
      "user_id": "user2",
      "user_name": "Bob Johnson",
      "content": "Could you explain how you handled the state management?",
      "created_at": "2024-12-15T16:45:00Z"
    }
  ]
}
```

#### Error Responses
- `403` - Cannot view comments on private submissions
- `403` - Not enrolled in course
- `404` - Submission not found

## Data Models

### Assignment
```json
{
  "id": "string",
  "lesson_id": "string",
  "title": "string",
  "description": "string",
  "instructions": "string",
  "type": "project|exercise|reading",
  "due_date": "ISO 8601 date string",
  "required": "boolean",
  "created_at": "ISO 8601 date string",
  "updated_at": "ISO 8601 date string"
}
```

### Submission
```json
{
  "id": "string",
  "assignment_id": "string",
  "student_id": "string",
  "student_name": "string",
  "github_repo_url": "string|null",
  "live_preview_url": "string|null",
  "notes": "string|null",
  "is_public": "boolean",
  "submitted_at": "ISO 8601 date string",
  "updated_at": "ISO 8601 date string"
}
```

### Comment
```json
{
  "id": "string",
  "submission_id": "string",
  "user_id": "string",
  "user_name": "string",
  "content": "string",
  "created_at": "ISO 8601 date string",
  "updated_at": "ISO 8601 date string"
}
```

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

All API endpoints are subject to rate limiting:
- 100 requests per 15-minute window per IP address
- Rate limit headers are included in responses

## URL Validation

GitHub repository URLs and live preview URLs are validated to ensure they are properly formatted URLs. Invalid URLs will result in a 400 Bad Request response.