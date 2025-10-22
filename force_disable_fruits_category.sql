-- SQL to force-disable the Fruits category
-- This will mark the category as inactive without checking product references
-- Use this if you want to disable the category through direct database access

UPDATE categories 
SET 
    is_active = false,
    updated_at = NOW()
WHERE 
    id = 'e911eadf-1b44-439a-8c3c-0320fb1a6b73'
    AND name_en = 'Fruits';

-- To verify the update worked, run this query:
-- SELECT id, name_en, is_active, updated_at FROM categories WHERE id = 'e911eadf-1b44-439a-8c3c-0320fb1a6b73';