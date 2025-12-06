-- ============================================================================
-- Fix Cart Items RLS Policy
-- ============================================================================
-- This script fixes the Row Level Security policy for cart_items table
-- to allow authenticated users to manage their own cart items
-- ============================================================================

-- Enable RLS on cart_items table (if not already enabled)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

-- Policy: Users can view their own cart items
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own cart items
CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own cart items
CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own cart items
CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- Verification Query
-- ============================================================================
-- Run this to verify the policies were created successfully

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'cart_items'
ORDER BY policyname;

-- ============================================================================
-- Test Query (Optional)
-- ============================================================================
-- After running the above, test inserting a cart item:
-- This should work if you're authenticated

/*
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES (auth.uid(), 'some-product-id', 1);
*/
