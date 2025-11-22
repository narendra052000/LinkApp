@echo off
REM Quick Start Script for LinkProject (Windows)

echo 🚀 LinkProject - URL Shortener Setup
echo ====================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ npm found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo.

REM Copy .env if not exists
if not exist ".env.local" (
    echo 📝 Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please update .env.local with your PostgreSQL credentials
    echo    DATABASE_URL="postgresql://user:password@localhost:5432/linkproject"
) else (
    echo ✅ .env.local already exists
)

echo.

REM Run Prisma setup
echo 🗄️  Setting up database...
call npx prisma migrate dev --name init

echo.
echo ✅ Setup complete!
echo.
echo 🎉 Ready to start development!
echo.
echo Next steps:
echo   1. Update .env.local with your database credentials (if using Postgres)
echo   2. Run: npm run dev
echo   3. Open: http://localhost:3000
echo.
echo Other useful commands:
echo   npm run seed          - Seed database with sample data
echo   npm test              - Run test suite
echo   npm run lint          - Check code quality
echo   npm run format        - Format code automatically
echo.
pause
