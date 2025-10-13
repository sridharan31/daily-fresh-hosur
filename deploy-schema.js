#!/usr/bin/env node

/**
 * Quick Database Schema Deployment Script
 * 
 * This script will help you deploy the database schema to your Supabase project.
 * Make sure you have the Supabase CLI installed: npm install -g @supabase/cli
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUPABASE_URL = 'https://yvjxgoxrzkcjvuptblri.supabase.co';
const SCHEMA_FILE = path.join(__dirname, 'database', 'schema_safe.sql');

console.log('🚀 Daily Fresh Hosur - Database Schema Deployment');
console.log('==================================================');

// Check if schema file exists
if (!fs.existsSync(SCHEMA_FILE)) {
  console.error('❌ Schema file not found:', SCHEMA_FILE);
  console.log('\n📋 Please ensure the database/schema_safe.sql file exists.');
  process.exit(1);
}

console.log('✅ Schema file found:', SCHEMA_FILE);

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'ignore' });
  console.log('✅ Supabase CLI is installed');
} catch (error) {
  console.error('❌ Supabase CLI not found');
  console.log('\n📦 Install with: npm install -g @supabase/cli');
  console.log('🔗 Or visit: https://supabase.com/docs/guides/cli');
  process.exit(1);
}

console.log('\n🗄️  Database Information:');
console.log('   URL:', SUPABASE_URL);
console.log('   Schema file:', 'database/schema_safe.sql');

console.log('\n📋 Manual Deployment Steps:');
console.log('   1. Go to your Supabase dashboard: https://supabase.com/dashboard');
console.log('   2. Select your project: Daily Fresh Hosur');
console.log('   3. Go to SQL Editor');
console.log('   4. Copy and paste the contents of database/schema_safe.sql');
console.log('   5. Click "Run" to execute the schema');

console.log('\n🔒 Or use Supabase CLI:');
console.log('   1. Login: supabase login');
console.log('   2. Link project: supabase link --project-ref yvjxgoxrzkcjvuptblri');
console.log('   3. Deploy: supabase db push');

console.log('\n⚡ Quick Test Commands:');
console.log('   • Test authentication: node -e "console.log(\'Run AuthTestApp.tsx\')"');
console.log('   • Check database: supabase db diff');
console.log('   • View logs: supabase functions logs');

console.log('\n🎯 After deployment, test with:');
console.log('   1. Run your Expo app');
console.log('   2. Use QuickAuthTestScreen for authentication testing');
console.log('   3. Check Supabase dashboard for user data');

console.log('\n✨ Schema deployment guide complete!');
console.log('📧 Need help? Check the Supabase documentation.');