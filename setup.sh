#!/bin/bash
# ProtexxaLearn Startup Script

echo "🚀 Starting ProtexxaLearn..."
echo ""

# Copy .env files if they don't exist
if [ ! -f ".env" ]; then
  echo "📋 Creating backend .env file..."
  cp .env.example .env
fi

if [ ! -f "frontend/.env" ]; then
  echo "📋 Creating frontend .env file..."
  cp frontend/.env.example frontend/.env
fi

echo "📊 Initializing database..."
node initdb.js

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "🎨 Installing/starting frontend..."
cd frontend

echo "✨ Frontend setup complete!"
echo ""
echo "👉 To start the application, run in two terminals:"
echo "   Terminal 1: npm start           (Backend on port 3000)"
echo "   Terminal 2: cd frontend && npm run dev (Frontend on port 5173)"
