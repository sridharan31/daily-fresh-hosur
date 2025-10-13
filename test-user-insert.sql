-- Quick test to insert a user into Supabase
-- Run this in your Supabase SQL Editor first

-- Check if users table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- If the table doesn't exist, you need to run the schema_safe.sql first

-- If table exists, try to insert a test user
INSERT INTO users (
  id,
  email,
  phone,
  full_name,
  role,
  preferred_language,
  is_verified
) VALUES (
  '2e8e8b4c-c4a9-4701-8d98-02252e44767d',
  'justinsridhar@gmail.com',
  '+91589619817',  -- Changed from UAE format to proper Indian format
  'SRIDHARAN PERIYANNAN',
  'customer',
  'en',
  false
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  full_name = EXCLUDED.full_name,
  preferred_language = EXCLUDED.preferred_language;

-- Check if the user was inserted
SELECT * FROM users WHERE email = 'justinsridhar@gmail.com';