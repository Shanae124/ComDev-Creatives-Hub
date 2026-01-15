#!/usr/bin/env node
/**
 * Railway Production Startup Script
 * Launches both API (port 3001) and Next.js (platform PORT) in one container
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_PORT = 3001;
const INIT_DB = process.env.INIT_DB === 'true';

console.log('\n🚀 ProtexxaLearn LMS - Starting Production Services');
console.log('================================================');
console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`Next.js Port: ${PORT}`);
console.log(`API Port: ${API_PORT}`);
console.log(`Database Init: ${INIT_DB ? 'YES' : 'NO'}`);
console.log('================================================\n');

// Check for required environment variables
const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('Set these in Railway → Variables tab');
  process.exit(1);
}

// Initialize database if needed (first deploy)
async function initDatabase() {
  if (!INIT_DB) return;
  
  console.log('🗄️  Initializing database schema...');
  return new Promise((resolve, reject) => {
    const init = spawn('node', ['initdb.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    init.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database initialized successfully\n');
        resolve();
      } else {
        console.warn(`⚠️  Database init exited with code ${code} (may already exist)\n`);
        resolve(); // Continue anyway
      }
    });
    
    init.on('error', (err) => {
      console.error('❌ Database init failed:', err.message);
      reject(err);
    });
  });
}

// Start API server
function startAPI() {
  console.log(`🔧 Starting API server on port ${API_PORT}...`);
  
  const api = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: API_PORT.toString(),
      API_PORT: API_PORT.toString()
    }
  });

  api.on('error', (err) => {
    console.error('❌ API server failed to start:', err.message);
    process.exit(1);
  });

  api.on('close', (code) => {
    console.error(`❌ API server exited with code ${code}`);
    process.exit(code || 1);
  });

  return api;
}

// Start Next.js
function startNextJS() {
  console.log(`🌐 Starting Next.js on port ${PORT}...\n`);
  
  const next = spawn('npx', ['next', 'start', '-p', PORT.toString()], {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });

  next.on('error', (err) => {
    console.error('❌ Next.js failed to start:', err.message);
    process.exit(1);
  });

  next.on('close', (code) => {
    console.error(`❌ Next.js exited with code ${code}`);
    process.exit(code || 1);
  });

  return next;
}

// Graceful shutdown
function setupShutdownHandlers(processes) {
  const shutdown = (signal) => {
    console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
    processes.forEach(proc => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM');
      }
    });
    setTimeout(() => process.exit(0), 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Main startup sequence
(async () => {
  try {
    // Step 1: Initialize database if needed
    await initDatabase();

    // Step 2: Start API server
    const api = startAPI();
    
    // Wait a moment for API to bind to port
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Start Next.js
    const next = startNextJS();

    // Setup graceful shutdown
    setupShutdownHandlers([api, next]);

    console.log('✅ All services started successfully!');
    console.log(`📡 Public URL will serve Next.js on port ${PORT}`);
    console.log(`🔒 API accessible internally at http://127.0.0.1:${API_PORT}\n`);

  } catch (err) {
    console.error('💥 Startup failed:', err.message);
    process.exit(1);
  }
})();
