#!/usr/bin/env node
/**
 * Railway Deployment Diagnostic Tool
 * Tests your live ProtexxaLearn deployment end-to-end
 */

const https = require('https');
const http = require('http');

// CHANGE THIS to your Railway URL
const RAILWAY_URL = process.argv[2] || 'https://protexxalearn-production.up.railway.app';

console.log('\n🔍 ProtexxaLearn Railway Deployment Test');
console.log('==========================================');
console.log(`Testing: ${RAILWAY_URL}\n`);

const tests = [];
let passed = 0;
let failed = 0;

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const req = lib.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ProtexxaLearn-Test/1.0',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: null, raw: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function test(name, fn) {
  process.stdout.write(`${name}... `);
  try {
    const result = await fn();
    if (result.pass) {
      console.log('✅ PASS');
      if (result.message) console.log(`   → ${result.message}`);
      passed++;
    } else {
      console.log('❌ FAIL');
      console.log(`   → ${result.message || 'No details'}`);
      if (result.details) console.log(`   → Details: ${JSON.stringify(result.details, null, 2)}`);
      failed++;
    }
  } catch (err) {
    console.log('❌ ERROR');
    console.log(`   → ${err.message}`);
    failed++;
  }
}

async function main() {
  // Test 1: Root endpoint
  await test('Root endpoint responds', async () => {
    const res = await request(RAILWAY_URL);
    if (res.status === 200 && res.data?.status === 'online') {
      return { pass: true, message: `Version: ${res.data.version || 'unknown'}` };
    }
    return { pass: false, message: `Got ${res.status}: ${res.raw}`, details: res.data };
  });

  // Test 2: Health check
  await test('Health check (/health)', async () => {
    const res = await request(`${RAILWAY_URL}/health`);
    if (res.status === 200 || res.status === 503) {
      const db = res.data?.services?.database?.status;
      if (db === 'connected') {
        return { pass: true, message: 'Database connected' };
      } else {
        return { pass: false, message: `Database: ${db || 'unknown'}`, details: res.data };
      }
    }
    return { pass: false, message: `Got ${res.status}`, details: res.data };
  });

  // Test 3: Registration endpoint exists
  await test('Registration endpoint exists', async () => {
    const res = await request(`${RAILWAY_URL}/auth/register`, {
      method: 'POST',
      body: {} // Empty body to test endpoint
    });
    // Should get 400 (validation error) not 404
    if (res.status === 400) {
      return { pass: true, message: 'Endpoint found (validation working)' };
    } else if (res.status === 404) {
      return { pass: false, message: 'Endpoint not found - routing issue?', details: res.data };
    } else if (res.status === 500) {
      return { pass: false, message: 'Server error - check DATABASE_URL', details: res.data };
    }
    return { pass: false, message: `Unexpected status ${res.status}`, details: res.data };
  });

  // Test 4: Full registration flow
  await test('Full registration test', async () => {
    const testEmail = `test-${Date.now()}@protexxalearn.test`;
    const testPayload = {
      name: 'Test User',
      email: testEmail,
      password: 'SecurePass123!',
      role: 'student'
    };

    const res = await request(`${RAILWAY_URL}/auth/register`, {
      method: 'POST',
      body: testPayload
    });

    if (res.status === 200 && res.data?.user) {
      return { 
        pass: true, 
        message: `Created user: ${res.data.user.email}${res.data.emailPreviewUrl ? ' (check email preview)' : ''}` 
      };
    } else if (res.status === 400) {
      return { pass: false, message: res.data?.error || 'Validation error', details: res.data };
    } else if (res.status === 500) {
      return { pass: false, message: res.data?.error || 'Server error', details: res.data };
    }
    return { pass: false, message: `Unexpected response ${res.status}`, details: res.data };
  });

  // Test 5: Check if Next.js is serving
  await test('Next.js frontend loads', async () => {
    const res = await request(RAILWAY_URL);
    const contentType = res.headers['content-type'] || '';
    if (contentType.includes('html') || res.raw.includes('<!DOCTYPE html') || res.raw.includes('<html')) {
      return { pass: true, message: 'HTML response detected' };
    }
    return { pass: false, message: 'No HTML content - Next.js not serving?', details: { contentType } };
  });

  // Summary
  console.log('\n==========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('==========================================\n');

  if (failed > 0) {
    console.log('🔧 Troubleshooting Steps:');
    console.log('1. In Railway UI → Your Service → Variables:');
    console.log('   - Check DATABASE_URL is set (copy from Postgres "Connect" tab)');
    console.log('   - Check JWT_SECRET is set (any random string)');
    console.log('   - Check NODE_ENV=production');
    console.log('   - Check EMAIL_SERVICE=ethereal');
    console.log('\n2. Check deployment logs in Railway:');
    console.log('   - Look for "Database connection failed"');
    console.log('   - Look for "Server: http://..." startup message');
    console.log('   - Check for errors during npm build');
    console.log('\n3. Verify Start Command:');
    console.log('   - Should be empty (uses Procfile) OR');
    console.log('   - Set to: npx concurrently -k -s first "API_PORT=3001 node server.js" "next start"');
    console.log('\n');
  } else {
    console.log('✅ All tests passed! Your deployment is working correctly.\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\n💥 Test runner crashed:', err.message);
  process.exit(1);
});
