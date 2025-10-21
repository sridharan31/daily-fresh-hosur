// Script to create the missing create_order function
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Replace with your Supabase project URL and service role key
// NOTE: For security, you would normally use environment variables for these values
const SUPABASE_URL = 'https://yvjxgoxrzkcjvuptblri.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // Use service role key for admin operations

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read the SQL file
const sqlPath = path.join(__dirname, 'database', 'create_order_function.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function createFunction() {
  console.log('Creating create_order function in Supabase...');
  
  const { data, error } = await supabase.rpc('pgexec', { sql });
  
  if (error) {
    console.error('Error creating function:', error);
    return;
  }
  
  console.log('Function created successfully!');
}

createFunction().catch(console.error);