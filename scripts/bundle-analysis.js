#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * This script provides additional insights about the bundle after building.
 * It complements the visual bundle analyzer (stats.html) with text-based analysis.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

function formatBytes(bytes) {
  if (bytes === 0) {return '0 Bytes';}
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundles() {
  console.log('\n🔍 Bundle Analysis Report\n');
  console.log('=' .repeat(50));

  if (!fs.existsSync(ASSETS_DIR)) {
    console.log('❌ No build found. Run "npm run build" first.');
    return;
  }

  const files = fs.readdirSync(ASSETS_DIR);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));
  const mapFiles = files.filter(file => file.endsWith('.map'));

  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;

  console.log('\n📦 JavaScript Bundles:');
  console.log('-'.repeat(30));
  
  jsFiles.forEach(file => {
    const filePath = path.join(ASSETS_DIR, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalSize += size;
    jsSize += size;
    
    let category = '📄 Other';
    if (file.includes('vendor')) {category = '📚 Vendor';}
    else if (file.includes('three')) {category = '🎨 Three.js';}
    else if (file.includes('ui')) {category = '🎯 UI';}
    else if (file.includes('index')) {category = '🏠 Main';}
    
    console.log(`${category}: ${file} (${formatBytes(size)})`);
  });

  console.log('\n🎨 CSS Files:');
  console.log('-'.repeat(30));
  
  cssFiles.forEach(file => {
    const filePath = path.join(ASSETS_DIR, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalSize += size;
    cssSize += size;
    console.log(`💄 ${file} (${formatBytes(size)})`);
  });

  console.log('\n📊 Summary:');
  console.log('-'.repeat(30));
  console.log(`Total JavaScript: ${formatBytes(jsSize)}`);
  console.log(`Total CSS: ${formatBytes(cssSize)}`);
  console.log(`Total Assets: ${formatBytes(totalSize)}`);
  console.log(`Source Maps: ${mapFiles.length} files`);

  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');
  console.log('-'.repeat(30));
  
  if (jsSize > 500 * 1024) {
    console.log('⚠️  Large JavaScript bundle detected. Consider:');
    console.log('   - Code splitting more aggressively');
    console.log('   - Tree shaking unused code');
    console.log('   - Lazy loading non-critical components');
  }
  
  if (cssSize > 100 * 1024) {
    console.log('⚠️  Large CSS bundle detected. Consider:');
    console.log('   - Purging unused CSS');
    console.log('   - Critical CSS extraction');
  }

  const largestJs = jsFiles.reduce((largest, file) => {
    const filePath = path.join(ASSETS_DIR, file);
    const size = fs.statSync(filePath).size;
    return size > largest.size ? { file, size } : largest;
  }, { file: '', size: 0 });

  if (largestJs.size > 200 * 1024) {
    console.log(`⚠️  Large chunk detected: ${largestJs.file} (${formatBytes(largestJs.size)})`);
    console.log('   Consider splitting this chunk further');
  }

  console.log('\n🎯 Next Steps:');
  console.log('-'.repeat(30));
  console.log('1. Open dist/stats.html for visual bundle analysis');
  console.log('2. Run "npm run audit:performance" for Lighthouse audit');
  console.log('3. Test loading performance on slow networks');
  
  console.log('\n✅ Analysis complete!\n');
}

analyzeBundles();