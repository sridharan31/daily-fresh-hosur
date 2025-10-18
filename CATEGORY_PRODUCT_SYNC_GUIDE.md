# Category-Based Product List Synchronization with Supabase

This guide outlines the steps for properly syncing category-based product listings with Supabase in the Daily Fresh Hosur app.

## Implementation Status

The app is already configured with Supabase integration for category-based product listing. The following components have been implemented:

1. **Product Adapter**: Converting Supabase data models to app models
2. **Product Service**: Methods to fetch products from Supabase
3. **Category Screen**: Using Supabase data instead of hardcoded data

## Key Files

1. **app/category/[id].tsx**: Displays products for a specific category
2. **lib/services/productService.ts**: Contains methods to fetch products from Supabase
3. **lib/adapters/productAdapter.ts**: Converts between Supabase and app data models

## Recent Improvements

We've enhanced the category-based product listing with the following improvements:

1. Added a flexible `getProductsByCategoryIdentifier()` method that can fetch products using either category ID or name
2. Implemented fallback mechanisms when products cannot be found for a category
3. Added better error handling and retry options

## Database Schema (Supabase)

According to your schema.sql, the Supabase database has the following tables relevant to categories and products:

```sql
-- Product categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en VARCHAR(100) NOT NULL,
  name_ta VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table with Tamil support
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  category_id UUID REFERENCES categories(id),
  category_en product_category NOT NULL,
  category_ta TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'kg',
  weight DECIMAL(8,3),
  gst_rate DECIMAL(5,2) DEFAULT 18.00,
  hsn_code TEXT,
  fssai_license TEXT,
  is_organic BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  nutritional_info JSONB,
  storage_instructions TEXT,
  /* Other fields */
);
```

## How the Integration Works

1. **Fetching Categories**:
   - The HomeScreen fetches categories using `productService.getCategories()`
   - Categories are adapted to app format using `adaptCategoriesForApp()`

2. **Category Navigation**:
   - When a user taps a category, they navigate to `/category/[id]`
   - The category ID and name are passed as parameters

3. **Loading Products by Category**:
   - The CategoryScreen uses `getProductsByCategoryIdentifier()` to find products
   - This method first tries to find the category by ID, then by name
   - Products are adapted to app format using `adaptProductsForApp()`

4. **Fallback Mechanism**:
   - If no products are found, a fallback search is attempted using the category name

## Steps to Add a New Category and Products

1. **Add a new category in Supabase**:
   ```sql
   INSERT INTO categories (name_en, name_ta, description_en, description_ta, sort_order)
   VALUES ('New Category', 'புதிய வகை', 'Description in English', 'Tamil description', 7);
   ```

2. **Add products for this category**:
   ```sql
   INSERT INTO products (
     name_en, name_ta, category_id, category_en, category_ta, price, mrp, 
     stock_quantity, unit, images, is_featured
   ) VALUES (
     'New Product', 'புதிய பொருள்', 
     (SELECT id FROM categories WHERE name_en = 'New Category'), 
     'new_category', 'புதிய வகை', 
     100.00, 110.00, 50, 'kg', ARRAY['https://example.com/image.jpg'], true
   );
   ```

3. **Verify in the app**:
   - The new category should appear in the HomeScreen
   - Clicking on it should show the products you added

## Common Issues and Solutions

1. **Products not showing for a category**:
   - Check if the `category_en` field in products matches exactly with the category name
   - Verify that `is_active` is set to true for both the category and products
   - Make sure `stock_quantity` is greater than 0

2. **Category not showing in the app**:
   - Check if `is_active` is set to true in the categories table
   - Verify the `sort_order` is appropriate

3. **Images not loading**:
   - Ensure image URLs in the `images` array are accessible

## Testing Your Integration

1. Add a new test category and products in Supabase
2. Launch the app and verify the category appears on the home screen
3. Tap the category and confirm the products load correctly
4. Test sorting and filtering within the category
5. Verify product details when tapping on a product

This completes the guide for category-based product listing with Supabase integration.