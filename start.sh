#!/usr/bin/env bash
# ProtexxaLearn Quick Start Script

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎓 ProtexxaLearn - Learning Management System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking Prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION"
else
    echo "✗ Node.js not found. Please install Node.js 22.x or later"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm $NPM_VERSION"
else
    echo "✗ npm not found"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "✓ PostgreSQL $PSQL_VERSION"
else
    echo "⚠ PostgreSQL not found in PATH (it should be running locally)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Offer setup options
echo "What would you like to do?"
echo ""
echo "1) Install dependencies (npm install)"
echo "2) Initialize database (node initdb.js)"
echo "3) Start backend server (npm run backend)"
echo "4) Start frontend dev server (npm run dev)"
echo "5) Run everything (needs 2 terminals)"
echo "6) Verify setup (test-integration.ps1)"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo ""
        echo "📦 Installing dependencies..."
        npm install
        echo ""
        echo "✓ Dependencies installed!"
        ;;
    2)
        echo ""
        echo "🗄 Initializing database..."
        node initdb.js
        echo ""
        echo "✓ Database initialized!"
        ;;
    3)
        echo ""
        echo "🚀 Starting backend server..."
        npm run backend
        ;;
    4)
        echo ""
        echo "🚀 Starting frontend dev server..."
        npm run dev
        ;;
    5)
        echo ""
        echo "🚀 ProtexxaLearn is ready to start!"
        echo ""
        echo "Please open TWO terminal windows:"
        echo ""
        echo "📺 Terminal 1 - Backend Server (Port 3000)"
        echo "   npm run backend"
        echo ""
        echo "📺 Terminal 2 - Frontend Dev Server (Port 3001)"
        echo "   npm run dev"
        echo ""
        echo "Then visit: http://localhost:3001"
        echo ""
        ;;
    6)
        echo ""
        echo "🧪 Running verification..."
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            pwsh -File test-integration.ps1
        else
            echo "Verification script is for Windows (test-integration.ps1)"
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation:"
echo "   • INTEGRATION.md - Complete integration guide"
echo "   • QUICKSTART.md - Quick setup instructions"
echo "   • SETUP_COMPLETE.md - Setup completion summary"
echo "   • PRODUCTION_GUIDE.md - Deployment guide"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
