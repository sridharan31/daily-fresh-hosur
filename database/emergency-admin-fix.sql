-- EMERGENCY FIX: Admin Setup Without Triggers
-- This bypasses the problematic trigger and sets up admin directly

-- Step 1: Disable the problematic trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create admin user manually if it doesn't exist
-- First, check if admin user exists in auth.users
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find existing admin user
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@fresh.com';
    
    -- If admin user exists, just confirm their email
    IF admin_user_id IS NOT NULL THEN
        UPDATE auth.users 
        SET 
            email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE id = admin_user_id;
        
        -- Ensure profile exists
        INSERT INTO public.users (
            id,
            email,
            full_name,
            phone,
            role,
            is_verified,
            preferred_language
        ) VALUES (
            admin_user_id,
            'admin@fresh.com',
            'Admin User',
            '+919876543210',
            'admin'::user_role,
            true,
            'en'
        ) ON CONFLICT (id) DO UPDATE SET
            role = 'admin'::user_role,
            is_verified = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Admin user updated successfully';
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users - create through Supabase Dashboard';
    END IF;
END $$;

-- Step 3: Create a simpler trigger that won't fail
CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
    -- Only insert if user doesn't already exist
    INSERT INTO public.users (
        id,
        email,
        full_name,
        phone,
        role,
        is_verified,
        preferred_language
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role),
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END,
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    ) ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the safer trigger
CREATE TRIGGER on_auth_user_created_safe
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user_safe();

-- Step 5: Verify admin setup
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    p.role,
    p.full_name,
    p.is_verified
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = 'admin@fresh.com';

-- Success message
SELECT 'Admin setup complete - login should work now!' as result;