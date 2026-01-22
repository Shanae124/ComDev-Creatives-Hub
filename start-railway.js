#!/usr/bin/env node
/**
 * Railway start script - ensures both API and Next.js start correctly
 * API binds to 3001, Next.js binds to Railway's PORT
 */

const { spawn } = require('child_process');

// Railway dynamically assigns PORT at runtime
const WEB_PORT = process.env.PORT || 3000;
const API_PORT = 3001;

console.log(`[Railway] Starting servers: API on ${API_PORT}, Web on ${WEB_PORT}`);
console.log(`[Railway] Environment PORT=${process.env.PORT}`);

// Start API server
const apiProcess = spawn('node', ['server.js'], {
  env: { ...process.env, PORT: String(API_PORT), API_PORT: String(API_PORT) },
  stdio: ['ignore', 'pipe', 'pipe']
});

apiProcess.stdout.on('data', (data) => {
  process.stdout.write(`[api] ${data}`);
});

apiProcess.stderr.on('data', (data) => {
  process.stderr.write(`[api] ${data}`);
});

// Wait a bit for API to start
setTimeout(() => {
  // Start Next.js server
  const webProcess = spawn('npx', ['next', 'start', '-p', String(WEB_PORT)], {
    env: { ...process.env, PORT: String(WEB_PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  webProcess.stdout.on('data', (data) => {
    process.stdout.write(`[web] ${data}`);
  });

  webProcess.stderr.on('data', (data) => {
    process.stderr.write(`[web] ${data}`);
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('[Railway] Received SIGTERM, shutting down...');
    apiProcess.kill();
    webProcess.kill();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('[Railway] Received SIGINT, shutting down...');
    apiProcess.kill();
    webProcess.kill();
    process.exit(0);
  });

  // Handle child process exits
  apiProcess.on('exit', (code) => {
    console.error(`[api] Process exited with code ${code}`);
    webProcess.kill();
    process.exit(code || 1);
  });

  webProcess.on('exit', (code) => {
    console.error(`[web] Process exited with code ${code}`);
    apiProcess.kill();
    process.exit(code || 1);
  });
}, 2000);
