-- Test the corrected trigger function
-- This will test if the enum casting works properly

-- Step 1: Test the function directly (simulating a trigger call)
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test-trigger@example.com';
BEGIN
  -- First, clean up any existing test data
  DELETE FROM public.users WHERE email = test_email;
  DELETE FROM auth.users WHERE email = test_email;
  
  -- Insert a test user into auth.users to trigger the function
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    test_email,
    'dummy_password',
    NOW(),
    '{"full_name": "Test User", "role": "customer", "preferred_language": "en"}'::jsonb,
    NOW(),
    NOW()
  );
  
  -- Check if the trigger worked
  IF EXISTS (SELECT 1 FROM public.users WHERE email = test_email) THEN
    RAISE NOTICE 'SUCCESS: Trigger worked! User created in public.users table';
  ELSE
    RAISE NOTICE 'ERROR: Trigger failed - no user in public.users table';
  END IF;
  
  -- Clean up test data
  DELETE FROM public.users WHERE email = test_email;
  DELETE FROM auth.users WHERE email = test_email;
  
END $$;

-- Step 2: Verify current trigger status
SELECT 
  'Trigger Verification:' as info,
  t.tgname as trigger_name,
  c.relname as table_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_auth_user_created';

-- Step 3: Check function definition
SELECT 
  'Function Definition:' as info,
  p.proname as function_name,
  CASE 
    WHEN p.prosrc LIKE '%::user_role%' THEN 'Has enum casting ✅'
    ELSE 'Missing enum casting ❌'
  END as enum_casting_status
FROM pg_proc p
WHERE p.proname = 'handle_new_user';