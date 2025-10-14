-- Fix admin email confirmation issue
-- This script will confirm the admin user's email so they can login

-- First, let's check if the admin user exists
SELECT id, email, email_confirmed_at, role from auth.users WHERE email = 'admin@fresh.com';

-- Update the admin user to confirm their email
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'admin@fresh.com';

-- Also ensure the user profile exists with admin role
INSERT INTO public.users (id, email, first_name, last_name, phone, user_role, created_at, updated_at)
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
  updated_at = NOW();

-- Verify the fix
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.user_role,
  p.first_name,
  p.last_name
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@fresh.com';