-- Manual sync of existing auth.users to public.users table
-- Run this after deploying the trigger to sync existing users

INSERT INTO public.users (id, email, full_name, phone, role, preferred_language, is_verified)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  au.raw_user_meta_data->>'phone' as phone,
  COALESCE(au.raw_user_meta_data->>'role', 'customer')::user_role as role,
  COALESCE(au.raw_user_meta_data->>'preferred_language', 'en') as preferred_language,
  CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END as is_verified
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  is_verified = EXCLUDED.is_verified;

-- Check the results
SELECT 
  'Sync completed!' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as profile_users_count;

-- Show the synced users
SELECT 
  id,
  email,
  full_name,
  phone,
  role,
  is_verified,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;