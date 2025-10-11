#!/usr/bin/env node

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function testLighthouse() {
  console.log('🚀 Testing Lighthouse functionality...');
  
  try {
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    console.log('✅ Chrome launched successfully');
    
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    };

    const url = 'http://localhost:4173';
    console.log(`📊 Running audit on ${url}`);
    
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    
    const { lhr } = runnerResult;
    const performance = lhr.categories.performance;
    
    console.log(`✅ Performance score: ${Math.round(performance.score * 100)}/100`);
    console.log('🎉 Lighthouse test completed successfully!');
    
  } catch (error) {
    console.error('❌ Lighthouse test failed:', error);
    console.error('Error details:', error.stack);
  }
}

testLighthouse();