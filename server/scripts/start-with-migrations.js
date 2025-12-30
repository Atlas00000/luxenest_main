#!/usr/bin/env node

/**
 * Startup script that runs migrations before starting the server
 * This provides better logging and error handling
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('='.repeat(60));
console.log('🚀 LuxeNest Server - Startup Script');
console.log('='.repeat(60));
console.log(`📅 Start Time: ${new Date().toISOString()}`);
console.log(`🌍 Node Version: ${process.version}`);
console.log('='.repeat(60));
console.log('');

async function runMigrations() {
  console.log('📋 Step 1/3: Running database migrations...');
  console.log('-'.repeat(60));
  
  try {
    // Run Prisma migrations
    execSync('pnpm prisma migrate deploy', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: process.env,
    });
    console.log('✅ Database migrations completed successfully');
    console.log('');
    return true;
  } catch (error) {
    console.error('❌ Database migrations failed');
    console.error('Error:', error.message);
    return false;
  }
}

async function startServer() {
  console.log('📋 Step 2/3: Starting server application...');
  console.log('-'.repeat(60));
  console.log('');
  
  try {
    // Start the server (this will not return)
    require('../dist/server.js');
  } catch (error) {
    console.error('❌ Failed to start server');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Main execution
(async () => {
  const migrationsSuccess = await runMigrations();
  
  if (!migrationsSuccess) {
    console.error('❌ Cannot start server: migrations failed');
    process.exit(1);
  }
  
  await startServer();
})();

