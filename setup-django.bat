@echo off
echo Setting up Django Backend...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

cd backend-django

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Create superuser (optional)
echo.
set /p create_superuser="Do you want to create a superuser account? (y/n): "
if /i "%create_superuser%"=="y" (
    python manage.py createsuperuser
)

echo.
echo Django backend setup complete!
echo.
echo To start the Django server manually:
echo   1. cd backend-django
echo   2. venv\Scripts\activate
echo   3. python manage.py runserver
echo.
echo Or use the start-servers.bat script to start both frontend and backend
pause