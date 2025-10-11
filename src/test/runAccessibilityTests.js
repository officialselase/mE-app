#!/usr/bin/env node

/**
 * Accessibility Test Runner
 * 
 * This script runs all accessibility tests and provides a comprehensive report.
 * It includes automated axe-core tests, keyboard navigation tests, and color contrast tests.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const testFiles = [
  'src/test/accessibility.test.jsx',
  'src/test/keyboardNavigation.test.jsx',
  'src/test/colorContrast.test.jsx',
  'src/components/__tests__/PageHeader.accessibility.test.jsx',
  'src/pages/__tests__/Login.accessibility.test.jsx',
  'src/pages/__tests__/Register.accessibility.test.jsx',
  'src/components/__tests__/AssignmentSubmissionForm.accessibility.test.jsx'
];

console.log('🔍 Running Accessibility Test Suite...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

for (const testFile of testFiles) {
  console.log(`📋 Running ${testFile}...`);
  
  try {
    const output = execSync(`npm test ${testFile}`, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    // Parse test results
    const lines = output.split('\n');
    const testLine = lines.find(line => line.includes('Tests'));
    
    if (testLine) {
      const matches = testLine.match(/(\d+) passed/);
      const passed = matches ? parseInt(matches[1]) : 0;
      
      const failMatches = testLine.match(/(\d+) failed/);
      const failed = failMatches ? parseInt(failMatches[1]) : 0;
      
      totalTests += passed + failed;
      passedTests += passed;
      failedTests += failed;
      
      results.push({
        file: testFile,
        passed,
        failed,
        status: failed === 0 ? '✅' : '❌'
      });
      
      console.log(`   ${failed === 0 ? '✅' : '❌'} ${passed} passed, ${failed} failed\n`);
    }
  } catch (error) {
    console.log(`   ❌ Test execution failed\n`);
    results.push({
      file: testFile,
      passed: 0,
      failed: 1,
      status: '❌',
      error: error.message
    });
    failedTests += 1;
    totalTests += 1;
  }
}

// Generate summary report
console.log('📊 Accessibility Test Summary');
console.log('================================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log(`Failed: ${failedTests} (${Math.round((failedTests / totalTests) * 100)}%)`);
console.log('');

console.log('📋 Detailed Results:');
results.forEach(result => {
  console.log(`${result.status} ${result.file}`);
  if (result.error) {
    console.log(`   Error: ${result.error.substring(0, 100)}...`);
  }
});

console.log('\n🎯 Accessibility Checklist:');
console.log('============================');

const checklist = [
  { item: 'Automated axe-core violations', status: results[0]?.status || '❌' },
  { item: 'Keyboard navigation support', status: results[1]?.status || '❌' },
  { item: 'Color contrast compliance', status: results[2]?.status || '❌' },
  { item: 'Navigation accessibility', status: results[3]?.status || '❌' },
  { item: 'Form accessibility (Login)', status: results[4]?.status || '❌' },
  { item: 'Form accessibility (Register)', status: results[5]?.status || '❌' },
  { item: 'Component accessibility', status: results[6]?.status || '❌' }
];

checklist.forEach(check => {
  console.log(`${check.status} ${check.item}`);
});

console.log('\n📝 Recommendations:');
console.log('===================');

if (failedTests > 0) {
  console.log('• Review failed tests and fix accessibility issues');
  console.log('• Run individual test files for detailed error information');
  console.log('• Use browser dev tools to manually verify accessibility');
  console.log('• Test with actual screen readers when possible');
} else {
  console.log('• All automated tests passed! 🎉');
  console.log('• Consider manual testing with screen readers');
  console.log('• Test with real users who use assistive technologies');
  console.log('• Run Lighthouse accessibility audits');
}

console.log('\n🔧 Manual Testing Checklist:');
console.log('============================');
console.log('• Test keyboard navigation on all pages');
console.log('• Verify screen reader announcements');
console.log('• Check color contrast with browser tools');
console.log('• Test with reduced motion preferences');
console.log('• Verify focus indicators are visible');
console.log('• Test form validation accessibility');
console.log('• Check responsive design accessibility');

// Exit with appropriate code
process.exit(failedTests > 0 ? 1 : 0);