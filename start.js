#!/usr/bin/env node
/**
 * Unified startup for Railway: API + Next.js frontend
 */

const { spawn, execSync } = require('child_process');
const http = require('http');
const pool = require('./db');

const PORT = process.env.PORT || 3000;
const API_PORT = 3001;

console.log(`[Startup] PORT=${PORT}, API_PORT=${API_PORT}`);

// Run database migrations
async function runMigrations() {
  console.log('[Startup] Running database migrations...');
  
  try {
    // Check if notifications table exists
    const client = await pool.connect();
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      );
    `);
    client.release();
    
    if (!result.rows[0].exists) {
      console.log('[Startup] Creating notifications table...');
      execSync('node migrate-notifications.js', { stdio: 'inherit' });
      console.log('[Startup] ✓ Notifications migration complete');
    } else {
      console.log('[Startup] ✓ Notifications table exists');
    }
  } catch (error) {
    console.error('[Startup] Migration check failed:', error.message);
    console.log('[Startup] Continuing without migration...');
  }
}

// Start API server
console.log('[Startup] Starting API server...');

runMigrations().then(() => {
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
