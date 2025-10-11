# Content Management API Documentation

This document describes the content management API endpoints for projects, thoughts, and work experience.

## Overview

All content endpoints support:
- Public read access (GET)
- Admin-only write access (POST, PUT, DELETE)
- Pagination for list endpoints
- Featured content filtering

## Projects API

### Get All Projects
```
GET /api/projects
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `featured` (optional): Filter featured projects (true/false)

**Response:**
```json
{
  "projects": [
    {
      "id": "abc123",
      "title": "Project Title",
      "description": "Short description",
      "long_description": "Detailed description",
      "images": ["url1", "url2"],
      "technologies": ["React", "Node.js"],
      "github_url": "https://github.com/...",
      "live_url": "https://example.com",
      "featured": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Get Single Project
```
GET /api/projects/:id
```

**Response:** Single project object

### Create Project (Admin Only)
```
POST /api/projects
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Project Title",
  "description": "Short description",
  "long_description": "Detailed description",
  "images": ["url1", "url2"],
  "technologies": ["React", "Node.js"],
  "github_url": "https://github.com/...",
  "live_url": "https://example.com",
  "featured": true
}
```

### Update Project (Admin Only)
```
PUT /api/projects/:id
Authorization: Bearer <token>
```

**Request Body:** Same as create (all fields optional)

### Delete Project (Admin Only)
```
DELETE /api/projects/:id
Authorization: Bearer <token>
```

## Thoughts API

### Get All Thoughts
```
GET /api/thoughts
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `featured` (optional): Filter featured thoughts (true/false)

**Response:**
```json
{
  "thoughts": [
    {
      "id": "abc123",
      "title": "Thought Title",
      "snippet": "Brief preview",
      "content": "Full content",
      "date": "2024-01-01T00:00:00.000Z",
      "featured": true,
      "tags": ["javascript", "react"],
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Get Single Thought
```
GET /api/thoughts/:id
```

### Create Thought (Admin Only)
```
POST /api/thoughts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Thought Title",
  "snippet": "Brief preview",
  "content": "Full content",
  "date": "2024-01-01T00:00:00.000Z",
  "featured": true,
  "tags": ["javascript", "react"]
}
```

### Update Thought (Admin Only)
```
PUT /api/thoughts/:id
Authorization: Bearer <token>
```

### Delete Thought (Admin Only)
```
DELETE /api/thoughts/:id
Authorization: Bearer <token>
```

## Work Experience API

### Get All Work Experience
```
GET /api/work
```

**Response:**
```json
[
  {
    "id": "abc123",
    "company": "Company Name",
    "position": "Job Title",
    "description": "Job description",
    "start_date": "2020-01-01",
    "end_date": "2022-12-31",
    "current": false,
    "technologies": ["React", "Node.js"],
    "display_order": 0,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Single Work Experience
```
GET /api/work/:id
```

### Create Work Experience (Admin Only)
```
POST /api/work
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "company": "Company Name",
  "position": "Job Title",
  "description": "Job description",
  "start_date": "2020-01-01",
  "end_date": "2022-12-31",
  "current": false,
  "technologies": ["React", "Node.js"],
  "display_order": 0
}
```

### Update Work Experience (Admin Only)
```
PUT /api/work/:id
Authorization: Bearer <token>
```

### Delete Work Experience (Admin Only)
```
DELETE /api/work/:id
Authorization: Bearer <token>
```

## Authentication

Admin endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

To get a token:
1. Register or login via `/api/auth/register` or `/api/auth/login`
2. Use the returned access token in subsequent requests
3. User must have `role: 'admin'` to access admin endpoints

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "fields": {
    "title": "Title is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required",
  "code": "TOKEN_REQUIRED",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "error": "Project not found"
}
```

## Testing

Run the test script to verify endpoints:
```powershell
# Start the server first
npm start

# In another terminal, run the test script
.\test-content-api.ps1
```
