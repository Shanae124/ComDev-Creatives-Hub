#!/usr/bin/env node
/**
 * Next.js Launcher for Railway
 * Ensures Next.js reads Railway's PORT environment variable
 */

const { spawn } = require('child_process');
const PORT = process.env.PORT || 3000;

console.log(`[Next.js Launcher] Starting Next.js on port ${PORT}...`);

const nextProcess = spawn('npx', ['next', 'start', '-p', String(PORT)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(PORT),
  }
});

nextProcess.on('error', (err) => {
  console.error('[Next.js Launcher] Error:', err);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  console.log(`[Next.js Launcher] Next.js exited with code ${code}`);
  process.exit(code);
});
