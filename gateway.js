#!/usr/bin/env node
/**
 * Railway Gateway - Single Process Router
 * This process listens on Railway's PORT and proxies to internal servers
 */

const http = require('http');
const httpProxy = require('http-proxy');

const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 3001;
const NEXT_PORT = 3000;

console.log(`[Railway Gateway] Starting...`);
console.log(`  Listening on: ${PORT} (Railway's assigned port)`);
console.log(`  API backend: http://localhost:${API_PORT}`);
console.log(`  Next.js app: http://localhost:${NEXT_PORT}`);
console.log('');

// Create proxies
const apiProxy = httpProxy.createProxyServer({ target: `http://localhost:${API_PORT}` });
const webProxy = httpProxy.createProxyServer({ target: `http://localhost:${NEXT_PORT}` });

// Handle errors
apiProxy.on('error', (err, req, res) => {
  console.error(`[API Proxy Error]: ${err.message}`);
  res.writeHead(503, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API service unavailable' }));
});

webProxy.on('error', (err, req, res) => {
  console.error(`[Web Proxy Error]: ${err.message}`);
  res.writeHead(503, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Web service unavailable' }));
});

// Main server
const server = http.createServer((req, res) => {
  // Route /api* requests to backend API
  if (req.url.startsWith('/api/')) {
    console.log(`[API] ${req.method} ${req.url}`);
    apiProxy.web(req, res);
  } 
  // Route everything else to Next.js
  else {
    console.log(`[WEB] ${req.method} ${req.url}`);
    webProxy.web(req, res);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Gateway ready on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Gateway] SIGTERM received, shutting down...');
  server.close(() => {
    console.log('[Gateway] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Gateway] SIGINT received, shutting down...');
  server.close(() => {
    console.log('[Gateway] Server closed');
    process.exit(0);
  });
});
