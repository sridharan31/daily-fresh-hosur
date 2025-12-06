-- Update user role to admin for admin@fresh.com
-- This script will update both the auth metadata and the users table

-- Step 1: Update the users table role
UPDATE public.users 
SET role = 'admin'::user_role 
WHERE email = 'admin@fresh.com';

-- Step 2: Update the auth.users metadata to include admin role
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'admin@fresh.com';

-- Step 3: Verify the update
SELECT 
  'User role update completed!' as status,
  u.email,
  u.role,
  u.full_name,
  u.created_at,
  au.raw_user_meta_data->>'role' as auth_role
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'admin@fresh.com';

-- Alternative: If the user doesn't exist yet, create admin user
-- Uncomment the lines below if you need to create a new admin user

/*
-- Create admin user if it doesn't exist
INSERT INTO public.users (id, email, full_name, role, preferred_language, is_verified)
SELECT 
  gen_random_uuid(),
  'admin@fresh.com',
  'Administrator',
  'admin'::user_role,
  'en',
  true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@fresh.com');
*/

-- Show all admin users
SELECT 
  email,
  full_name,
  role,
  is_verified,
  created_at
FROM public.users 
WHERE role = 'admin'::user_role
ORDER BY created_at DESC;