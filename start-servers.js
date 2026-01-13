#!/usr/bin/env node
/**
 * Start servers for Railway deployment
 * Handles both backend (Express) and frontend (Next.js)
 */

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 3000;
const NEXT_PORT = process.env.NEXT_PORT || PORT + 1;

console.log(`\n🚀 Starting ProtexxaLearn servers...`);
console.log(`   Backend: port ${PORT}`);
console.log(`   Frontend: port ${NEXT_PORT}\n`);

// Start backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: PORT
  }
});

// Start frontend server
const frontend = spawn('next', ['start', '-p', String(NEXT_PORT)], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: NEXT_PORT
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('\nShutting down servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

backend.on('error', (err) => {
  console.error('Backend error:', err);
  process.exit(1);
});

frontend.on('error', (err) => {
  console.error('Frontend error:', err);
  process.exit(1);
});
