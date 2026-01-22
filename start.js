#!/usr/bin/env node
/**
 * Unified startup for Railway: API + Next.js frontend
 */

const { spawn } = require('child_process');
const http = require('http');

const PORT = process.env.PORT || 3000;
const API_PORT = 3001;

console.log(`[Startup] PORT=${PORT}, API_PORT=${API_PORT}`);

// Start API server
console.log('[Startup] Starting API server...');
const apiProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: API_PORT,
    API_PORT: API_PORT
  }
});

// Wait for API, then start Next.js on Railway's PORT
setTimeout(() => {
  console.log(`[Startup] Starting Next.js on port ${PORT}...`);
  const webProcess = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production'
    }
  });

  webProcess.on('error', (err) => {
    console.error('[Startup] Next.js error:', err);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Startup] Shutting down...');
    apiProcess.kill('SIGTERM');
    webProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 3000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}, 3000);

apiProcess.on('error', (err) => {
  console.error('[Startup] API error:', err);
});
