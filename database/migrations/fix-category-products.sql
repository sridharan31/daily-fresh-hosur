-- Fix category_id and category_en relationships in products table
-- This SQL script ensures that products have consistent category IDs and names

-- First, let's check for products with missing category_id values
SELECT id, name_en, category_id, category_en 
FROM products 
WHERE category_id IS NULL 
LIMIT 10;

-- Update products with missing category_id based on category_en value
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category_id IS NULL
AND LOWER(c.name_en) = LOWER(p.category_en);

-- Find products where category_id exists but doesn't match any category
SELECT p.id, p.name_en, p.category_id, p.category_en, c.id AS actual_category_id, c.name_en AS actual_category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE c.id IS NULL AND p.category_id IS NOT NULL;

-- Create any missing categories based on unique category_en values in products
INSERT INTO categories (name_en, name_ta, description_en, is_active)
SELECT DISTINCT category_en, category_ta, 'Auto-created category', true
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE LOWER(c.name_en) = LOWER(p.category_en)
)
AND category_en IS NOT NULL;

-- Update all products to ensure category_id and category_en are consistent
UPDATE products p
SET category_id = c.id
FROM categories c
WHERE LOWER(c.name_en) = LOWER(p.category_en)
AND (p.category_id IS NULL OR p.category_id != c.id);

-- Verify the fixes
SELECT 
  p.id, 
  p.name_en, 
  p.category_id, 
  p.category_en,
  c.name_en AS category_name
FROM products p
JOIN categories c ON p.category_id = c.id
LIMIT 20;

-- Check for any remaining inconsistencies
SELECT 
  p.id, 
  p.name_en, 
  p.category_id, 
  p.category_en,
  c.name_en AS category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE LOWER(c.name_en) != LOWER(p.category_en)
LIMIT 20;