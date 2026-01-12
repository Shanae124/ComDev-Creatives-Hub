#!/usr/bin/env node

/**
 * ProtexxaLearn Development Server Startup
 * 
 * Usage:
 *   npm run dev           - Start Next.js frontend on port 3000
 *   npm run backend       - Start Node.js backend on port 3000 (requires different process)
 *   npm run dev:all       - Start both (requires concurrently installed)
 */

const { spawn } = require('child_process');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

console.log('🚀 ProtexxaLearn Development Environment');
console.log('==========================================\n');

if (isDev) {
  console.log('📋 Development Mode');
  console.log('');
  console.log('To start the complete development environment:');
  console.log('');
  console.log('Terminal 1 (Backend - Port 3000):');
  console.log('  npm run backend');
  console.log('');
  console.log('Terminal 2 (Frontend - Port 3001 or next available):');
  console.log('  npm run dev');
  console.log('');
  console.log('Or use concurrently:');
  console.log('  npm install -D concurrently');
  console.log('  concurrently "npm run backend" "npm run dev"');
  console.log('');
  console.log('==========================================');
  console.log('');
  console.log('📍 API Configuration:');
  console.log('  Backend API: http://localhost:3000');
  console.log('  Frontend: http://localhost:3001 (or next available)');
  console.log('  API Base URL: NEXT_PUBLIC_API_URL env var');
  console.log('');
  console.log('🔧 Requirements:');
  console.log('  ✓ Node.js 22.x or later');
  console.log('  ✓ PostgreSQL 12+ running on localhost:5432');
  console.log('  ✓ Environment variables configured (.env.local)');
  console.log('');
}
