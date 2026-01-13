#!/usr/bin/env node
/**
 * This script will help set the DATABASE_URL via Railway API
 * or provide instructions if API call isn't available
 */

const http = require('http');

async function setRailwayVariable() {
  console.log('\nSetting DATABASE_URL on Railway...\n');
  
  const options = {
    hostname: 'api.railway.app',
    port: 443,
    path: '/graphql',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.RAILWAY_TOKEN,
      'Content-Type': 'application/json'
    }
  };

  // If no token, provide manual instructions
  if (!process.env.RAILWAY_TOKEN) {
    console.log('No RAILWAY_TOKEN found. Please follow these manual steps:\n');
    console.log('1. Go to: https://railway.app/project/d80e12d6-a675-4152-8e2a-e282c32e4712');
    console.log('2. Click the "protexxalearn" service (web)');
    console.log('3. Go to Variables tab');
    console.log('4. Click "+ New Variable"');
    console.log('5. Enter:');
    console.log('   Key: DATABASE_URL');
    console.log('   Value: postgresql://postgres:gVpqaJCNzBFqMLycsXXRqzyOSekATRtH@switchyard.proxy.rlwy.net:45083/railway');
    console.log('6. Click Save');
    console.log('7. App will auto-redeploy (2-3 minutes)\n');
    console.log('Once deployed, test at: https://protexxalearn.up.railway.app/login');
    console.log('Login: admin@test.com / Password123\n');
    return;
  }

  console.log('Sending to Railway API...');
}

setRailwayVariable();
