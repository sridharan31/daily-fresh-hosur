-- Daily Fresh Hosur - Database Deployment Instructions
-- Execute this SQL in your Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/yvjxgoxrzkcjvuptblri/sql

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Step 2: Execute the complete schema
-- Copy and paste the contents of database/schema.sql into the SQL editor

-- Step 3: Verify installation
-- Run these queries to check if everything is set up correctly:

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show all the tables: categories, products, users, etc.

-- Step 4: Insert sample data (optional)
-- You can add some sample categories and products for testing

INSERT INTO categories (id, name_en, name_ta, description_en, description_ta, image_url, sort_order, is_active) VALUES
('cat-vegetables', 'Vegetables', 'காய்கறிகள்', 'Fresh vegetables', 'புதிய காய்கறிகள்', 'https://example.com/vegetables.jpg', 1, true),
('cat-fruits', 'Fruits', 'பழங்கள்', 'Fresh fruits', 'புதிய பழங்கள்', 'https://example.com/fruits.jpg', 2, true),
('cat-dairy', 'Dairy', 'பால் பொருட்கள்', 'Milk and dairy products', 'பால் மற்றும் பால் பொருட்கள்', 'https://example.com/dairy.jpg', 3, true);

-- Check if data was inserted
SELECT * FROM categories LIMIT 5;

-- Step 5: Test RLS policies
-- Try to query as different users to ensure security is working
-- This should work (public data):
SELECT * FROM categories WHERE is_active = true;

-- This should be restricted (user-specific data):
-- SELECT * FROM user_profiles; -- This will only show data for authenticated users

COMMIT;