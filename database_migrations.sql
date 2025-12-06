-- ============================================================================
-- Admin UX Database Integration - Migration Script
-- ============================================================================
-- This script ensures all required tables and columns exist for the admin
-- inventory and user management features.
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. Verify no errors appear
-- ============================================================================

-- ============================================================================
-- PART 1: Admin Users Table
-- ============================================================================

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  role_id TEXT NOT NULL DEFAULT 'manager',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON admin_users(role_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 2: Products Table Updates
-- ============================================================================

-- Add inventory management columns to products table
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS last_restocked TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for inventory queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_min_stock ON products(min_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- ============================================================================
-- PART 3: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admin users can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can view their own profile" ON admin_users;

-- Policy: All authenticated admin users can view all admin users
CREATE POLICY "Admin users can view all admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Policy: Super admins can perform all operations on admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() 
      AND role_id = 'super_admin' 
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() 
      AND role_id = 'super_admin' 
      AND is_active = true
    )
  );

-- Policy: Admins can view and update their own profile
CREATE POLICY "Admins can view their own profile"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can update their own profile"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- PART 4: Insert Sample Admin Users (Optional)
-- ============================================================================

-- NOTE: You'll need to replace the UUIDs below with actual user IDs from auth.users
-- To get user IDs, run: SELECT id, email FROM auth.users;

-- Uncomment and modify the following INSERT statements after replacing UUIDs:

/*
INSERT INTO admin_users (id, email, first_name, last_name, role_id, is_active, last_login)
VALUES 
  ('YOUR-USER-UUID-HERE', 'admin@dailyfreshhosur.com', 'Admin', 'User', 'super_admin', true, NOW()),
  ('YOUR-USER-UUID-HERE', 'manager@dailyfreshhosur.com', 'Store', 'Manager', 'manager', true, NOW())
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- PART 5: Verification Queries
-- ============================================================================

-- Run these queries to verify the migration was successful:

-- 1. Check admin_users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- 2. Check products table has new columns
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('min_stock', 'last_restocked');

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'admin_users';

-- 4. Count admin users
SELECT COUNT(*) as admin_user_count FROM admin_users;

-- 5. Check products with low stock
SELECT id, name_en, stock_quantity, min_stock
FROM products
WHERE stock_quantity <= min_stock
ORDER BY stock_quantity ASC
LIMIT 10;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Verify all queries above return expected results
-- 2. Create initial admin users if needed (see PART 4)
-- 3. Proceed with service layer and UI updates
-- ============================================================================
