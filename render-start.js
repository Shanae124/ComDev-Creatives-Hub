#!/usr/bin/env node
/**
 * Unified startup for Render.com
 * Starts both API and Next.js servers
 */

const { spawn } = require('child_process');

const WEB_PORT = process.env.PORT || 3000;
const API_PORT = 3001;

console.log('[Render] Starting ProtexxaLearn...');
console.log(`  Web Port: ${WEB_PORT}`);
console.log(`  API Port: ${API_PORT}`);

// Start API server
console.log('[Render] Starting API server...');
const apiProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    API_PORT: API_PORT,
    PORT: API_PORT
  }
});

apiProcess.on('error', (err) => {
  console.error('[Render] API error:', err);
  process.exit(1);
});

// Wait for API, then start Next.js
setTimeout(() => {
  console.log('[Render] Starting Next.js...');
  const webProcess = spawn('npx', ['next', 'start', '-p', String(WEB_PORT)], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: WEB_PORT
    }
  });

  webProcess.on('error', (err) => {
    console.error('[Render] Next.js error:', err);
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Render] Shutting down...');
    apiProcess.kill();
    webProcess.kill();
    setTimeout(() => process.exit(0), 2000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}, 3000);
