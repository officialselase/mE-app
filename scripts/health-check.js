#!/usr/bin/env node

/**
 * Health check script for deployment verification
 */

import axios from 'axios';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

console.log('🏥 Running deployment health checks...\n');

// Check frontend availability
async function checkFrontend() {
  console.log('🌐 Checking frontend availability...');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
    if (response.status === 200) {
      console.log('✅ Frontend is accessible');
      return true;
    }
  } catch (error) {
    console.log('❌ Frontend check failed:', error.message);
    return false;
  }
}

// Check backend API health
async function checkBackend() {
  console.log('🔧 Checking backend API health...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health/`, { timeout: 10000 });
    if (response.status === 200) {
      console.log('✅ Backend API is healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

// Check critical API endpoints
async function checkCriticalEndpoints() {
  console.log('🎯 Checking critical API endpoints...');
  
  const endpoints = [
    '/api/portfolio/projects/',
    '/api/portfolio/thoughts/',
    '/api/portfolio/work-experience/',
    '/api/shop/products/',
    '/api/learn/courses/'
  ];
  
  let passedCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 5000 });
      if (response.status === 200) {
        console.log(`✅ ${endpoint} - OK`);
        passedCount++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Failed: ${error.message}`);
    }
  }
  
  console.log(`📊 Endpoint health: ${passedCount}/${endpoints.length} passing`);
  return passedCount === endpoints.length;
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log('🔐 Checking environment variables...');
  
  const requiredVars = [
    'VITE_DJANGO_API_URL',
    'VITE_GEMINI_API_KEY'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} - Set`);
    } else {
      console.log(`❌ ${varName} - Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Main health check
async function runHealthCheck() {
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}\n`);
  
  const results = {
    environment: checkEnvironmentVariables(),
    frontend: await checkFrontend(),
    backend: await checkBackend(),
    endpoints: await checkCriticalEndpoints()
  };
  
  console.log('\n📋 Health Check Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check.charAt(0).toUpperCase() + check.slice(1)}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const overallHealth = Object.values(results).every(result => result);
  
  console.log('\n🎯 Overall Status:', overallHealth ? '✅ HEALTHY' : '❌ UNHEALTHY');
  
  if (!overallHealth) {
    console.log('\n⚠️  Issues detected. Please resolve before deployment.');
    process.exit(1);
  } else {
    console.log('\n🚀 All systems go! Ready for deployment.');
  }
}

runHealthCheck().catch(error => {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
});