#!/usr/bin/env node

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const AUDIT_CONFIG = {
  // Lighthouse configuration
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'interactive',
      'performance-score'
    ],
    throttling: {
      // Simulate slow 4G network
      rttMs: 150,
      throughputKbps: 1.6 * 1024,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 150,
      downloadThroughputKbps: 1.6 * 1024,
      uploadThroughputKbps: 750,
    },
    emulatedFormFactor: 'mobile',
  }
};

const DESKTOP_CONFIG = {
  ...AUDIT_CONFIG,
  settings: {
    ...AUDIT_CONFIG.settings,
    emulatedFormFactor: 'desktop',
    throttling: {
      // Simulate desktop connection
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    }
  }
};

// Pages to audit
const PAGES_TO_AUDIT = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/work', name: 'Work' },
  { path: '/projects', name: 'Projects' },
  { path: '/thoughts', name: 'Thoughts' },
  { path: '/shop', name: 'Shop' },
  { path: '/cart', name: 'Cart' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  // Note: Protected routes (/learn, /projects-repo) would need authentication
];

async function runLighthouseAudit(url, config, deviceType) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options, config);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

function formatResults(results, pageName, deviceType) {
  const { lhr } = results;
  const performance = lhr.categories.performance;
  const audits = lhr.audits;

  return {
    page: pageName,
    device: deviceType,
    performanceScore: Math.round(performance.score * 100),
    metrics: {
      firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
      largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
      speedIndex: audits['speed-index']?.displayValue || 'N/A',
      cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
      interactive: audits['interactive']?.displayValue || 'N/A',
    },
    passed: performance.score >= 0.9 // 90+ score requirement
  };
}

async function auditAllPages() {
  const baseUrl = process.env.AUDIT_URL || 'http://localhost:5173';
  const results = [];
  
  console.log(`🚀 Starting performance audits for ${baseUrl}`);
  console.log('📱 Testing both mobile and desktop configurations');
  console.log('🐌 Using throttled network and CPU settings\n');

  for (const page of PAGES_TO_AUDIT) {
    const url = `${baseUrl}${page.path}`;
    
    try {
      console.log(`📊 Auditing ${page.name} (${url})`);
      
      // Mobile audit
      console.log('  📱 Mobile audit...');
      const mobileResult = await runLighthouseAudit(url, AUDIT_CONFIG, 'mobile');
      const mobileFormatted = formatResults(mobileResult, page.name, 'mobile');
      results.push(mobileFormatted);
      
      // Desktop audit
      console.log('  🖥️  Desktop audit...');
      const desktopResult = await runLighthouseAudit(url, DESKTOP_CONFIG, 'desktop');
      const desktopFormatted = formatResults(desktopResult, page.name, 'desktop');
      results.push(desktopFormatted);
      
      console.log(`  ✅ ${page.name} completed\n`);
      
    } catch (error) {
      console.error(`❌ Error auditing ${page.name}:`, error.message);
      results.push({
        page: page.name,
        device: 'mobile',
        error: error.message,
        passed: false
      });
      results.push({
        page: page.name,
        device: 'desktop', 
        error: error.message,
        passed: false
      });
    }
  }

  return results;
}

function generateReport(results) {
  console.log('\n📈 PERFORMANCE AUDIT RESULTS');
  console.log('=' .repeat(80));
  
  const failedAudits = [];
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.page} (${result.device}): ERROR - ${result.error}`);
      failedAudits.push(result);
      return;
    }
    
    const status = result.passed ? '✅' : '❌';
    const score = result.performanceScore;
    
    console.log(`${status} ${result.page} (${result.device}): ${score}/100`);
    
    if (result.metrics) {
      console.log(`   FCP: ${result.metrics.firstContentfulPaint}`);
      console.log(`   LCP: ${result.metrics.largestContentfulPaint}`);
      console.log(`   SI: ${result.metrics.speedIndex}`);
      console.log(`   CLS: ${result.metrics.cumulativeLayoutShift}`);
      console.log(`   TBT: ${result.metrics.totalBlockingTime}`);
      console.log(`   TTI: ${result.metrics.interactive}`);
    }
    
    if (!result.passed) {
      failedAudits.push(result);
    }
    
    console.log('');
  });
  
  // Summary
  const totalAudits = results.filter(r => !r.error).length;
  const passedAudits = results.filter(r => r.passed && !r.error).length;
  const passRate = totalAudits > 0 ? Math.round((passedAudits / totalAudits) * 100) : 0;
  
  console.log('📊 SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Total audits: ${totalAudits}`);
  console.log(`Passed (90+): ${passedAudits}`);
  console.log(`Failed (<90): ${totalAudits - passedAudits}`);
  console.log(`Pass rate: ${passRate}%`);
  
  if (failedAudits.length > 0) {
    console.log('\n⚠️  FAILED AUDITS REQUIRING OPTIMIZATION:');
    failedAudits.forEach(audit => {
      if (audit.error) {
        console.log(`- ${audit.page} (${audit.device}): ${audit.error}`);
      } else {
        console.log(`- ${audit.page} (${audit.device}): ${audit.performanceScore}/100`);
      }
    });
  }
  
  // Save detailed results to file
  const reportPath = path.join(process.cwd(), 'performance-audit-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  
  return {
    totalAudits,
    passedAudits,
    failedAudits,
    passRate
  };
}

async function main() {
  try {
    console.log('🚀 Starting performance audit script...');
    const results = await auditAllPages();
    const summary = generateReport(results);
    
    // Exit with error code if audits failed
    if (summary.failedAudits.length > 0) {
      console.log('\n❌ Some performance audits failed. Please optimize the failing pages.');
      process.exit(1);
    } else {
      console.log('\n✅ All performance audits passed!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Performance audit failed:', error);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
}

// Run the main function
main();

export { auditAllPages, generateReport };