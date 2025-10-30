#!/usr/bin/env node

/**
 * Integration Verification Script
 * Verifies that frontend and backend are properly connected
 */

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:8000';
const TIMEOUT = 5000;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function checkServer(url, name) {
  try {
    const response = await axios.get(url, { timeout: TIMEOUT });
    logSuccess(`${name} is running (${response.status})`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logError(`${name} is not running at ${url}`);
    } else {
      logError(`${name} check failed: ${error.message}`);
    }
    return false;
  }
}

async function checkDjangoHealth() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health/`, { timeout: TIMEOUT });
    logSuccess('Django health check passed');
    logInfo(`Database: ${response.data.database}`);
    logInfo(`Services: ${Object.entries(response.data.services).map(([k, v]) => `${k}:${v}`).join(', ')}`);
    return true;
  } catch (error) {
    logError(`Django health check failed: ${error.message}`);
    return false;
  }
}

async function checkDjangoEndpoints() {
  const endpoints = [
    '/api/portfolio/projects/',
    '/api/portfolio/thoughts/',
    '/api/portfolio/work/',
    '/api/shop/products/',
    '/api/learn/courses/',
  ];

  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, { 
        timeout: TIMEOUT,
        validateStatus: (status) => status < 500 // Accept 4xx as valid (might be auth required)
      });
      
      if (response.status < 400) {
        logSuccess(`${endpoint} - OK (${response.status})`);
        successCount++;
      } else if (response.status === 401) {
        logWarning(`${endpoint} - Requires authentication (${response.status})`);
        successCount++; // Still counts as working
      } else {
        logWarning(`${endpoint} - ${response.status}`);
      }
    } catch (error) {
      logError(`${endpoint} - ${error.message}`);
    }
  }
  
  return successCount;
}

function checkEnvironmentConfig() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    const hasGeminiKey = envContent.includes('VITE_GEMINI_API_KEY');
    const hasDjangoUrl = envContent.includes('VITE_DJANGO_API_URL');
    
    if (hasGeminiKey) {
      logSuccess('Gemini API key configured');
    } else {
      logWarning('Gemini API key not found in .env');
    }
    
    if (hasDjangoUrl) {
      logSuccess('Django API URL configured');
      const match = envContent.match(/VITE_DJANGO_API_URL=(.+)/);
      if (match) {
        logInfo(`Django URL: ${match[1]}`);
      }
    } else {
      logError('Django API URL not configured in .env');
    }
    
    return hasGeminiKey && hasDjangoUrl;
  } catch (error) {
    logError(`Environment config check failed: ${error.message}`);
    return false;
  }
}

async function checkFrontendBuild() {
  try {
    // Check if frontend is accessible
    const response = await axios.get(FRONTEND_URL, { timeout: TIMEOUT });
    logSuccess('Frontend is accessible');
    
    // Check if it contains expected content
    const html = response.data;
    if (html.includes('Ransford') || html.includes('portfolio')) {
      logSuccess('Frontend content looks correct');
      return true;
    } else {
      logWarning('Frontend content might not be correct');
      return false;
    }
  } catch (error) {
    logError(`Frontend check failed: ${error.message}`);
    return false;
  }
}

async function main() {
  log('🔍 Starting Integration Verification...', 'bold');
  console.log();
  
  let issues = 0;
  
  // Check environment configuration
  log('📋 Checking Environment Configuration...', 'blue');
  if (!checkEnvironmentConfig()) {
    issues++;
  }
  console.log();
  
  // Check if servers are running
  log('🌐 Checking Server Status...', 'blue');
  const frontendRunning = await checkServer(FRONTEND_URL, 'Frontend (React)');
  const backendRunning = await checkServer(BACKEND_URL, 'Backend (Django)');
  
  if (!frontendRunning) {issues++;}
  if (!backendRunning) {issues++;}
  console.log();
  
  if (backendRunning) {
    // Check Django health
    log('🏥 Checking Django Health...', 'blue');
    if (!await checkDjangoHealth()) {
      issues++;
    }
    console.log();
    
    // Check Django endpoints
    log('🔗 Checking Django API Endpoints...', 'blue');
    const workingEndpoints = await checkDjangoEndpoints();
    if (workingEndpoints < 3) {
      issues++;
      logWarning(`Only ${workingEndpoints}/5 endpoints are working properly`);
    } else {
      logSuccess(`${workingEndpoints}/5 endpoints are working`);
    }
    console.log();
  }
  
  if (frontendRunning) {
    // Check frontend
    log('⚛️  Checking Frontend...', 'blue');
    if (!await checkFrontendBuild()) {
      issues++;
    }
    console.log();
  }
  
  // Summary
  log('📊 Integration Verification Summary', 'bold');
  if (issues === 0) {
    logSuccess('All checks passed! Frontend and backend are properly integrated.');
    console.log();
    logInfo('You can now:');
    logInfo('• Visit the frontend at http://localhost:5173');
    logInfo('• Access Django admin at http://localhost:8000/admin/');
    logInfo('• View API docs at http://localhost:8000/api/');
  } else {
    logError(`Found ${issues} issue(s) that need attention.`);
    console.log();
    logInfo('Common solutions:');
    logInfo('• Make sure both servers are running');
    logInfo('• Check your .env configuration');
    logInfo('• Verify Django migrations are applied');
    logInfo('• Ensure all dependencies are installed');
  }
  
  process.exit(issues > 0 ? 1 : 0);
}

main().catch(error => {
  logError(`Verification script failed: ${error.message}`);
  process.exit(1);
});