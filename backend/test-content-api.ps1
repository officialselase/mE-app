# Test script for content management API endpoints
# Run this after starting the server with: npm start

$baseUrl = "http://localhost:5000/api"

Write-Host "`n=== Testing Content Management API ===" -ForegroundColor Cyan

# Test Projects endpoints
Write-Host "`n--- Testing Projects API ---" -ForegroundColor Yellow
Write-Host "GET /api/projects"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects" -Method Get
    Write-Host "✓ Success: Retrieved $($response.projects.Count) projects" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nGET /api/projects?featured=true"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/projects?featured=true" -Method Get
    Write-Host "✓ Success: Retrieved $($response.projects.Count) featured projects" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Thoughts endpoints
Write-Host "`n--- Testing Thoughts API ---" -ForegroundColor Yellow
Write-Host "GET /api/thoughts"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/thoughts" -Method Get
    Write-Host "✓ Success: Retrieved $($response.thoughts.Count) thoughts" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nGET /api/thoughts?featured=true"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/thoughts?featured=true" -Method Get
    Write-Host "✓ Success: Retrieved $($response.thoughts.Count) featured thoughts" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Work Experience endpoints
Write-Host "`n--- Testing Work Experience API ---" -ForegroundColor Yellow
Write-Host "GET /api/work"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/work" -Method Get
    Write-Host "✓ Success: Retrieved $($response.Count) work experience entries" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== All Tests Complete ===" -ForegroundColor Cyan
Write-Host "`nNote: To test admin endpoints (POST, PUT, DELETE), you need to:" -ForegroundColor Yellow
Write-Host "1. Register/login as an admin user" -ForegroundColor Yellow
Write-Host "2. Include the JWT token in the Authorization header" -ForegroundColor Yellow
