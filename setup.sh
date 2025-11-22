#!/bin/bash
# Quick Start Script for LinkProject

echo "🚀 LinkProject - URL Shortener Setup"
echo "===================================="
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""

# Check PostgreSQL connection
echo "🔍 Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
else
    echo "⚠️  PostgreSQL client not found (optional for local SQLite testing)"
fi

echo ""

# Copy .env if not exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your PostgreSQL credentials"
    echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/linkproject\""
else
    echo "✅ .env.local already exists"
fi

echo ""

# Run Prisma setup
echo "🗄️  Setting up database..."
npx prisma migrate dev --name init || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Ready to start development!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your database credentials (if using Postgres)"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "Other useful commands:"
echo "  npm run seed          - Seed database with sample data"
echo "  npm test              - Run test suite"
echo "  npm run lint          - Check code quality"
echo "  npm run format        - Format code automatically"
echo ""
