@echo off
REM ProtexxaLearn Startup Script for Windows

echo 🚀 Starting ProtexxaLearn...
echo.

REM Copy .env files if they don't exist
if not exist ".env" (
  echo 📋 Creating backend .env file...
  copy .env.example .env
)

if not exist "frontend\.env" (
  echo 📋 Creating frontend .env file...
  copy frontend\.env.example frontend\.env
)

echo 📊 Initializing database...
node initdb.js

echo.
echo ✅ Backend setup complete!
echo.
echo 👉 To start the application, run in two terminals:
echo    Terminal 1: npm start           (Backend on port 3000)
echo    Terminal 2: cd frontend ^&^& npm run dev (Frontend on port 5173)
