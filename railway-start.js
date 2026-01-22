#!/usr/bin/env node
/**
 * Railway-specific startup - FIXED for 502 errors
 * Key: API must listen on Railway's PORT, Next.js runs internally
 */

const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const API_PORT = PORT; // Railway expects service on its PORT
const NEXT_PORT = 3002; // Internal Next.js port

console.log('[Railway] Starting ProtexxaLearn...');
console.log(`  Railway PORT: ${PORT}`);
console.log(`  API Port: ${API_PORT}`);
console.log(`  Next.js Port (internal): ${NEXT_PORT}`);

// Start Next.js first (internal only)
console.log('[Railway] Starting Next.js (internal)...');
const webProcess = spawn('npx', ['next', 'start', '-p', String(NEXT_PORT)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: NEXT_PORT
  }
});

webProcess.on('error', (err) => {
  console.error('[Railway] Next.js error:', err);
  process.exit(1);
});

// Wait 3s for Next.js, then start API on Railway's PORT
setTimeout(() => {
  console.log(`[Railway] Starting API server on PORT ${API_PORT}...`);
  const apiProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: API_PORT,
      NEXT_PORT: NEXT_PORT // Pass to API for proxying if needed
    }
  });

  apiProcess.on('error', (err) => {
    console.error('[Railway] API error:', err);
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Railway] Shutting down...');
    webProcess.kill();
    apiProcess.kill();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}, 3000);
    if (!ready) {
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
  }
  
  if (ready) {
    console.log(`[Railway] API is ready! Starting Next.js on port ${WEB_PORT}...`);
  } else {
    console.warn(`[Railway] API health check failed after ${attempts}s, proceeding anyway...`);
  }
  
  const webProcess = spawn('npx', ['next', 'start'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: WEB_PORT
    },
    cwd: process.cwd()
  });

  webProcess.on('error', (err) => {
    console.error('[Railway] Next.js process error:', err);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Railway] SIGTERM received, shutting down gracefully...');
    apiProcess.kill('SIGTERM');
    webProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 5000);
  });

  process.on('SIGINT', () => {
    console.log('[Railway] SIGINT received, shutting down...');
    apiProcess.kill('SIGINT');
    webProcess.kill('SIGINT');
    process.exit(0);
  });
})();

