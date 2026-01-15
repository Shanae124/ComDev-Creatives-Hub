#!/bin/bash
# Railway startup script - ensures both API and Next.js start correctly

echo "🚀 Starting ProtexxaLearn LMS..."
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run database initialization if needed (first deploy)
if [ "$INIT_DB" = "true" ]; then
  echo "🗄️  Initializing database..."
  node initdb.js
fi

# Start both API (port 3001) and Next.js (platform PORT)
echo "✅ Launching API on 3001 and Next.js on $PORT..."
exec npx concurrently -k -s first -n api,web -c green,blue \
  "API_PORT=3001 node server.js" \
  "next start -p $PORT"
