-- SAFE ADMIN SETUP - Using Supabase RPC Functions
-- This approach uses proper Supabase functions instead of direct auth table manipulation

-- Step 1: Create or update the admin user profile in the public.users table
-- (This assumes the auth.user already exists from signup)
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  phone,
  user_role,
  created_at,
  updated_at
) VALUES (
  -- You'll need to replace this UUID with the actual user ID from auth.users
  -- Get it by running: SELECT id FROM auth.users WHERE email = 'admin@fresh.com';
  'REPLACE_WITH_ACTUAL_USER_ID',
  'admin@fresh.com',
  'Admin',
  'User',
  '+919876543210',
  'admin'::user_role,
  NOW(),
  NOW()
) ON CONFLICT (id) 
DO UPDATE SET 
  user_role = 'admin'::user_role,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Step 2: Create a function to safely confirm admin email
-- (This function will need to be created with service role privileges)
CREATE OR REPLACE FUNCTION confirm_admin_email(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow this for the specific admin email
  IF admin_email = 'admin@fresh.com' THEN
    UPDATE auth.users 
    SET 
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE email = admin_email;
  ELSE
    RAISE EXCEPTION 'Unauthorized email confirmation attempt';
  END IF;
END;
$$;

-- Step 3: Execute the function to confirm admin email
SELECT confirm_admin_email('admin@fresh.com');

-- Step 4: Verify the setup
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  p.user_role,
  p.first_name,
  p.last_name
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@fresh.com';