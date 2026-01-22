#!/usr/bin/env node
/**
 * Combined Server for Railway
 * Single HTTP server that proxies to both API and Next.js
 */

const http = require('http');
const https = require('https');
const path = require('path');

const WEB_PORT = process.env.PORT || 3000;
const API_PORT = 3001;

console.log(`[Gateway] Combined server starting on port ${WEB_PORT}...`);
console.log(`[Gateway] API backend on internal port ${API_PORT}`);

// Start API server first
const apiProcess = require('child_process').spawn('node', ['server.js'], {
  env: { ...process.env, API_PORT: API_PORT, PORT: API_PORT },
  stdio: 'inherit'
});

// Start Next.js server
setTimeout(() => {
  require('child_process').spawn('npx', ['next', 'start', '-p', String(API_PORT + 1000)], {
    env: { ...process.env, PORT: String(API_PORT + 1000) },
    stdio: 'inherit'
  });
}, 3000);

// Create gateway server
const server = http.createServer((req, res) => {
  console.log(`[Gateway] ${req.method} ${req.url}`);
  
  // API requests
  if (req.url.startsWith('/api/') || req.url === '/health') {
    const options = {
      hostname: 'localhost',
      port: API_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const apiReq = http.request(options, (apiRes) => {
      res.writeHead(apiRes.statusCode, apiRes.headers);
      apiRes.pipe(res);
    });
    
    apiReq.on('error', () => {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API unavailable' }));
    });
    
    req.pipe(apiReq);
  }
  // Everything else to Next.js
  else {
    const options = {
      hostname: 'localhost',
      port: API_PORT + 1000,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const webReq = http.request(options, (webRes) => {
      res.writeHead(webRes.statusCode, webRes.headers);
      webRes.pipe(res);
    });
    
    webReq.on('error', () => {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Web service unavailable');
    });
    
    req.pipe(webReq);
  }
});

server.listen(WEB_PORT, '0.0.0.0', () => {
  console.log(`✅ [Gateway] Listening on 0.0.0.0:${WEB_PORT}`);
});

process.on('SIGTERM', () => {
  console.log('[Gateway] Shutting down...');
  apiProcess.kill();
  server.close(() => process.exit(0));
});
