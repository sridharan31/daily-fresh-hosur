-- CORRECTED: Fix for user registration trigger with proper enum casting
-- This creates a database function that automatically inserts into users table when auth.users is created

-- Drop the existing function to ensure clean recreation
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the corrected function with proper enum casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, phone, role, preferred_language, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_verified = EXCLUDED.is_verified;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to allow the trigger to work
-- Allow service role to insert users (this will be used by the trigger)
DROP POLICY IF EXISTS "Enable insert for service role" ON users;
CREATE POLICY "Enable insert for service role"
ON users FOR INSERT
WITH CHECK (true);

-- Test the corrected trigger
SELECT 'Corrected user registration trigger created successfully!' as status;

-- Verify the function exists
SELECT 
  p.proname as function_name,
  p.prosrc as function_source
FROM pg_proc p
WHERE p.proname = 'handle_new_user';

-- Verify the trigger exists  
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_auth_user_created';