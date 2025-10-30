@echo off
echo Starting Django Backend and React Frontend...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

REM Install frontend dependencies if needed
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)

REM Install concurrently if not present
npm list concurrently >nul 2>&1
if errorlevel 1 (
    echo Installing concurrently...
    npm install --save-dev concurrently
)

REM Check if Django backend dependencies are installed
if not exist backend-django\venv (
    echo.
    echo Django virtual environment not found.
    echo Please set up the Django backend first:
    echo   1. cd backend-django
    echo   2. python -m venv venv
    echo   3. venv\Scripts\activate
    echo   4. pip install -r requirements.txt
    echo   5. python manage.py migrate
    echo.
    pause
    exit /b 1
)

echo.
echo Starting both servers...
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:8000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
npm run start:both