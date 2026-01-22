#!/bin/bash

# ProtexxaLearn Setup Script

echo "=== ProtexxaLearn Setup ==="

# Backend setup
echo "Setting up backend..."
cd backend
cp .env.example .env

# Update .env with PostgreSQL connection
read -p "Enter PostgreSQL connection URL (default: postgresql://postgres:postgres@localhost:5432/protexxalearn): " db_url
db_url=${db_url:-postgresql://postgres:postgres@localhost:5432/protexxalearn}

read -p "Enter JWT Secret (default: your_jwt_secret_key_change_in_production): " jwt_secret
jwt_secret=${jwt_secret:-your_jwt_secret_key_change_in_production}

sed -i "s|DATABASE_URL=.*|DATABASE_URL=$db_url|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env

echo "Installing backend dependencies..."
npm install

echo "Initializing database..."
npm run init-db

cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
cp .env.example .env.local

echo "Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "=== Setup Complete ==="
echo ""
echo "To start development:"
echo "  Backend:  cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo ""
