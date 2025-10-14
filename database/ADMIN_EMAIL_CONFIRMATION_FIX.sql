-- ADMIN EMAIL CONFIRMATION FIX
-- Run this script in your Supabase SQL Editor to fix the admin login issue

-- Step 1: Check current admin user status
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.user_role,
  p.first_name,
  p.last_name
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@fresh.com';

-- Step 2: Confirm the admin user's email (this fixes the "Email not confirmed" error)
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'admin@fresh.com';

-- Step 3: Ensure admin user profile exists with correct role
INSERT INTO public.users (
  id, 
  email, 
  first_name, 
  last_name, 
  phone, 
  user_role, 
  created_at, 
  updated_at
)
SELECT 
  u.id,
  u.email,
  'Admin',
  'User',
  '+919876543210',
  'admin'::user_role,
  NOW(),
  NOW()
FROM auth.users u 
WHERE u.email = 'admin@fresh.com'
ON CONFLICT (id) 
DO UPDATE SET 
  user_role = 'admin'::user_role,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Step 4: Verify the fix worked
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  p.user_role,
  p.first_name,
  p.last_name,
  p.phone
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@fresh.com';

-- If admin user doesn't exist, create one:
-- (Only run this if the above SELECT returns no results)

-- INSERT INTO auth.users (
--   email, 
--   email_confirmed_at, 
--   raw_user_meta_data, 
--   created_at, 
--   updated_at,
--   instance_id,
--   aud,
--   role
-- ) VALUES (
--   'admin@fresh.com',
--   NOW(),
--   '{"full_name": "Admin User"}',
--   NOW(),
--   NOW(),
--   '00000000-0000-0000-0000-000000000000',
--   'authenticated',
--   'authenticated'
-- );

-- Note: You'll need to set a password for the admin user through the Supabase Dashboard
-- or use the Supabase Auth API to create the user properly.