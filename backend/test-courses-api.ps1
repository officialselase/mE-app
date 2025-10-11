# Test script for Courses API
# This script tests the courses API endpoints

$baseUrl = "http://localhost:5000"

Write-Host "Testing Courses API..." -ForegroundColor Green

# Test 1: Register a test user (regular user)
Write-Host "`n1. Registering test user..." -ForegroundColor Yellow
$registerData = @{
    email = "student@example.com"
    password = "TestPass123"
    displayName = "Test Student"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ User registered successfully" -ForegroundColor Green
    $token = $registerResponse.accessToken
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️ User already exists, trying to login..." -ForegroundColor Yellow
        
        # Try to login instead
        $loginData = @{
            email = "student@example.com"
            password = "TestPass123"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
            Write-Host "✅ User logged in successfully" -ForegroundColor Green
            $token = $loginResponse.accessToken
        } catch {
            Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Skip course creation (requires instructor role)
Write-Host "`n2. Skipping course creation (requires instructor role)..." -ForegroundColor Yellow
Write-Host "   Regular users can only view and enroll in existing courses" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 3: Get all courses
Write-Host "`n3. Fetching all courses..." -ForegroundColor Yellow
try {
    $coursesResponse = Invoke-RestMethod -Uri "$baseUrl/api/courses" -Method GET -Headers $headers
    Write-Host "✅ Courses fetched successfully" -ForegroundColor Green
    Write-Host "   Found $($coursesResponse.courses.Count) courses" -ForegroundColor Cyan
    
    if ($coursesResponse.courses.Count -gt 0) {
        $firstCourse = $coursesResponse.courses[0]
        Write-Host "   First course: $($firstCourse.title)" -ForegroundColor Cyan
        Write-Host "   Instructor: $($firstCourse.instructor_name)" -ForegroundColor Cyan
        Write-Host "   Enrolled: $($firstCourse.is_enrolled)" -ForegroundColor Cyan
        $courseId = $firstCourse.id
    }
} catch {
    Write-Host "❌ Failed to fetch courses: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Enroll in course (if we have a course)
if ($courseId) {
    Write-Host "`n4. Enrolling in course..." -ForegroundColor Yellow
    try {
        $enrollResponse = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId/enroll" -Method POST -Headers $headers
        Write-Host "✅ Enrolled in course successfully" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "⚠️ Already enrolled in course" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Enrollment failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    # Test 5: Get course details (after enrollment)
    Write-Host "`n5. Fetching course details after enrollment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1  # Small delay to ensure enrollment is processed
    try {
        $courseDetailResponse = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId" -Method GET -Headers $headers
        Write-Host "✅ Course details fetched successfully" -ForegroundColor Green
        Write-Host "   Course: $($courseDetailResponse.title)" -ForegroundColor Cyan
        Write-Host "   Instructor: $($courseDetailResponse.instructor_name)" -ForegroundColor Cyan
        Write-Host "   Enrolled: $($courseDetailResponse.is_enrolled)" -ForegroundColor Cyan
        Write-Host "   Lessons: $($courseDetailResponse.lessons.Count)" -ForegroundColor Cyan
        Write-Host "   Progress: $($courseDetailResponse.progress.completion_percentage)%" -ForegroundColor Cyan
        
        if ($courseDetailResponse.lessons.Count -gt 0) {
            Write-Host "   First lesson: $($courseDetailResponse.lessons[0].title)" -ForegroundColor Cyan
            Write-Host "   Assignments in first lesson: $($courseDetailResponse.lessons[0].assignments.Count)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "❌ Failed to fetch course details: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Error details: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
    
    # Test 6: Get course progress
    Write-Host "`n6. Fetching course progress..." -ForegroundColor Yellow
    try {
        $progressResponse = Invoke-RestMethod -Uri "$baseUrl/api/courses/$courseId/progress" -Method GET -Headers $headers
        Write-Host "✅ Course progress fetched successfully" -ForegroundColor Green
        Write-Host "   Completed lessons: $($progressResponse.completed_lessons.Count)" -ForegroundColor Cyan
        Write-Host "   Total lessons: $($progressResponse.total_lessons)" -ForegroundColor Cyan
        Write-Host "   Completion: $($progressResponse.completion_percentage)%" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed to fetch course progress: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Courses API testing completed!" -ForegroundColor Green
Write-Host "The Learn page should now be able to fetch and display courses." -ForegroundColor Cyan