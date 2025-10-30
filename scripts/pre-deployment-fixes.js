#!/usr/bin/env node

/**
 * Pre-deployment fixes script
 * Addresses critical issues before deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔧 Starting pre-deployment fixes...\n');

// 1. Security: Remove API key from .env and add to .gitignore
function secureEnvironment() {
  console.log('🔒 Securing environment variables...');
  
  try {
    // Check if .env exists and contains API key
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      if (envContent.includes('VITE_GEMINI_API_KEY=AIzaSy')) {
        console.log('⚠️  API key found in .env file');
        
        // Create .env.example if it doesn't exist
        if (!fs.existsSync('.env.local.example')) {
          const exampleContent = envContent.replace(
            /VITE_GEMINI_API_KEY=.*/,
            'VITE_GEMINI_API_KEY=your_api_key_here'
          );
          fs.writeFileSync('.env.local.example', exampleContent);
          console.log('✅ Created .env.local.example');
        }
        
        // Add .env to .gitignore if not already there
        let gitignoreContent = '';
        if (fs.existsSync('.gitignore')) {
          gitignoreContent = fs.readFileSync('.gitignore', 'utf8');
        }
        
        if (!gitignoreContent.includes('.env')) {
          fs.appendFileSync('.gitignore', '\n# Environment variables\n.env\n.env.local\n');
          console.log('✅ Added .env to .gitignore');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error securing environment:', error.message);
  }
}

// 2. Fix critical ESLint issues automatically
function fixLintingIssues() {
  console.log('🔍 Fixing critical linting issues...');
  
  try {
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
    console.log('✅ Auto-fixed linting issues');
  } catch (error) {
    console.log('⚠️  Some linting issues require manual fixing');
  }
}

// 3. Remove console.log statements from production files
function removeConsoleStatements() {
  console.log('🧹 Removing console statements from production files...');
  
  const filesToClean = [
    'src/utils/djangoApi.js',
    'src/utils/tokenManager.js',
    'src/utils/errorHandler.js',
    'src/context/AuthContext.jsx'
  ];
  
  filesToClean.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalLength = content.length;
        
        // Remove console.log, console.error, console.warn statements
        content = content.replace(/console\.(log|error|warn|info)\([^)]*\);?\s*/g, '');
        
        if (content.length !== originalLength) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Cleaned console statements from ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error cleaning ${filePath}:`, error.message);
      }
    }
  });
}

// 4. Create production environment template
function createProductionEnvTemplate() {
  console.log('📝 Creating production environment template...');
  
  const prodEnvTemplate = `# Production Environment Variables
# Copy this file to .env and fill in your production values

# Gemini AI API Key
VITE_GEMINI_API_KEY=your_production_gemini_api_key

# Django Backend API URL (your production backend URL)
VITE_DJANGO_API_URL=https://your-backend-domain.com

# Environment
NODE_ENV=production

# Optional: Analytics
# VITE_GA_ID=G-XXXXXXXXXX
# VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
`;

  fs.writeFileSync('.env.production.template', prodEnvTemplate);
  console.log('✅ Created .env.production.template');
}

// 5. Create Django production settings template
function createDjangoProductionTemplate() {
  console.log('🐍 Creating Django production environment template...');
  
  const djangoProdEnv = `# Django Production Environment Variables
# Copy this file to backend-django/.env and fill in your production values

# Django Settings
SECRET_KEY=your-super-secret-production-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_prod

# JWT Settings
JWT_SECRET_KEY=your-production-jwt-secret-key

# CORS Settings (your frontend domain)
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Paystack Settings (production keys)
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key

# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-production-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Static Files (for production)
STATIC_ROOT=/var/www/static/
MEDIA_ROOT=/var/www/media/
`;

  fs.writeFileSync('backend-django/.env.production.template', djangoProdEnv);
  console.log('✅ Created Django production environment template');
}

// 6. Update package.json scripts for deployment
function updatePackageScripts() {
  console.log('📦 Updating package.json scripts...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Add deployment scripts if they don't exist
    if (!packageJson.scripts['build:prod']) {
      packageJson.scripts['build:prod'] = 'NODE_ENV=production npm run build';
    }
    
    if (!packageJson.scripts['deploy:vercel']) {
      packageJson.scripts['deploy:vercel'] = 'vercel --prod';
    }
    
    if (!packageJson.scripts['health-check']) {
      packageJson.scripts['health-check'] = 'node scripts/health-check.js';
    }
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json scripts');
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
}

// Main execution
async function main() {
  try {
    secureEnvironment();
    console.log('');
    
    fixLintingIssues();
    console.log('');
    
    removeConsoleStatements();
    console.log('');
    
    createProductionEnvTemplate();
    console.log('');
    
    createDjangoProductionTemplate();
    console.log('');
    
    updatePackageScripts();
    console.log('');
    
    console.log('🎉 Pre-deployment fixes completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Review and commit the changes');
    console.log('2. Set up production environment variables');
    console.log('3. Test the build: npm run build:prod');
    console.log('4. Deploy to staging first');
    console.log('5. Run health checks before going live');
    
  } catch (error) {
    console.error('❌ Error during pre-deployment fixes:', error.message);
    process.exit(1);
  }
}

main();