-- Fix Product Category Constraints
-- Remove NOT NULL constraints from category_en and category_ta since we use category_id foreign key

-- Make category_en optional (remove NOT NULL constraint)
ALTER TABLE products ALTER COLUMN category_en DROP NOT NULL;

-- Make category_ta optional (remove NOT NULL constraint)  
ALTER TABLE products ALTER COLUMN category_ta DROP NOT NULL;

-- Update existing products to have consistent category values based on category_id
UPDATE products 
SET 
  category_en = CASE 
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440000' THEN 'vegetables'::product_category
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440001' THEN 'fruits'::product_category
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440002' THEN 'dairy'::product_category
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440003' THEN 'grocery'::product_category
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440004' THEN 'spices'::product_category
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440005' THEN 'organic'::product_category
    ELSE NULL
  END,
  category_ta = CASE 
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440000' THEN 'காய்கறிகள்'
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440001' THEN 'பழங்கள்'
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440002' THEN 'பால் பொருட்கள்'
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440003' THEN 'மளிகை'
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440004' THEN 'மசாலா'
    WHEN category_id = '550e8400-e29b-41d4-a716-446655440005' THEN 'இயற்கை'
    ELSE NULL
  END
WHERE category_id IS NOT NULL;

-- Verify the changes
SELECT 'Fixed product category constraints' as status;
SELECT COUNT(*) as products_with_category_id FROM products WHERE category_id IS NOT NULL;
SELECT COUNT(*) as products_with_category_en FROM products WHERE category_en IS NOT NULL;