#!/usr/bin/env python3
"""
Django Backend Setup Script
"""
import os
import sys
import subprocess
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stderr:
            print(f"Error: {e.stderr}")
        return None

def main():
    print("🐍 Setting up Django Backend for Portfolio")
    print("=" * 50)
    
    # Check if Python is available
    python_cmd = "python" if platform.system() == "Windows" else "python3"
    
    # Install requirements
    if run_command(f"{python_cmd} -m pip install -r requirements.txt", "Installing Python packages"):
        print("📦 All packages installed successfully")
    else:
        print("❌ Failed to install packages. Please install manually:")
        print("pip install -r requirements.txt")
        return
    
    # Run migrations
    if run_command(f"{python_cmd} manage.py makemigrations", "Creating migrations"):
        run_command(f"{python_cmd} manage.py migrate", "Running migrations")
    
    # Create superuser
    print("\n👤 Creating admin superuser...")
    print("Please enter admin credentials:")
    
    try:
        subprocess.run([python_cmd, "manage.py", "createsuperuser"], check=True)
        print("✅ Superuser created successfully")
    except subprocess.CalledProcessError:
        print("⚠️ Superuser creation skipped or failed")
    
    # Collect static files
    run_command(f"{python_cmd} manage.py collectstatic --noinput", "Collecting static files")
    
    print("\n🎉 Django Backend Setup Complete!")
    print("=" * 50)
    print("🌐 To start the server, run:")
    print(f"   {python_cmd} manage.py runserver 8000")
    print("\n🔧 Admin portal will be available at:")
    print("   http://localhost:8000/admin/")
    print("\n📚 API endpoints will be available at:")
    print("   http://localhost:8000/api/")

if __name__ == "__main__":
    main()