#!/bin/bash

echo "🚀 Setting up Portfolio Backend..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Create database
echo "🗄️  Creating database..."
DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
createdb $DB_NAME 2>/dev/null || echo "Database already exists or couldn't be created"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Run 'npm run dev' to start the development server"
