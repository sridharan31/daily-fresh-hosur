-- Complete Admin User Management Script
-- Use this to create or update admin users

-- Method 1: Update existing user to admin
-- Replace 'admin@fresh.com' with the actual email you want to make admin

DO $$
DECLARE
    user_email TEXT := 'admin@fresh.com';
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = user_email) INTO user_exists;
    
    IF user_exists THEN
        -- Update existing user to admin
        UPDATE public.users 
        SET role = 'admin'::user_role 
        WHERE email = user_email;
        
        -- Update auth metadata
        UPDATE auth.users 
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
        WHERE email = user_email;
        
        RAISE NOTICE 'User % updated to admin role', user_email;
    ELSE
        RAISE NOTICE 'User % does not exist. Please create the user first through signup.', user_email;
    END IF;
END $$;

-- Method 2: Create a new admin user (if needed)
-- Uncomment and modify the section below to create a new admin

/*
INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_user_meta_data,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@dailyfreshhosur.com',
    crypt('AdminPassword123!', gen_salt('bf')), -- Change this password!
    NOW(),
    '{"role": "admin", "full_name": "Admin User"}'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Then insert into users table
INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role, 
    preferred_language, 
    is_verified
) 
SELECT 
    au.id,
    'admin@dailyfreshhosur.com',
    'Admin User',
    'admin'::user_role,
    'en',
    true
FROM auth.users au 
WHERE au.email = 'admin@dailyfreshhosur.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role;
*/

-- Verification: Show all admin users
SELECT 
    'Current Admin Users:' as info,
    u.email,
    u.full_name,
    u.role,
    u.is_verified,
    u.created_at,
    au.raw_user_meta_data->>'role' as auth_metadata_role
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.role = 'admin'::user_role
ORDER BY u.created_at DESC;

-- Quick check: Count users by role
SELECT 
    role,
    COUNT(*) as user_count
FROM public.users 
GROUP BY role
ORDER BY role;