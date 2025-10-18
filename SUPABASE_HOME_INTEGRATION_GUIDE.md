# Supabase Integration Guide for HomeScreen

## Overview
This guide walks through integrating Supabase to fetch products and categories for the Daily Fresh Hosur home page.

## Changes Made

### 1. **Updated HomeScreen Component** (`src/screens/home/HomeScreen.tsx`)

#### Key Improvements:

**Before:**
- Hardcoded categories and products
- No database connection
- Static data that couldn't be updated

**After:**
- Fetches categories from Supabase database
- Fetches featured products from Supabase
- Real-time product and category management
- Error handling and retry logic
- Refresh functionality
- Filter support with Supabase queries

#### Import Changes:
```typescript
// Added product service import
import { productService, Category } from '../../../lib/services/productService';
```

#### State Variables:
```typescript
const [categories, setCategories] = useState<Category[]>([]);
const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
const [error, setError] = useState<string | null>(null);
```

### 2. **Data Loading from Supabase**

#### Category Emoji Mapping:
```typescript
const CATEGORY_EMOJI_MAP: { [key: string]: string } = {
  'vegetables': '🥬',
  'fruits': '🍎',
  'organic': '🌱',
  'dairy': '🥛',
  'grocery': '🛒',
  'spices': '🌶️',
  'frozen': '❄️',
  'bakery': '🥖',
};
```

#### Load Data Function:
```typescript
const loadData = async () => {
  try {
    setError(null);
    setIsLoading(true);

    // Fetch categories from Supabase
    const fetchedCategories = await productService.getCategories();
    setCategories(fetchedCategories);

    // Fetch featured products from Supabase
    const filters = {
      isFeatured: true,
      limit: 10,
    };
    const fetchedProducts = await productService.getProducts(filters);
    setFeaturedProducts(fetchedProducts);
    setFilteredProducts(fetchedProducts);
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    setError('Failed to load products and categories');
    Alert.alert(
      'Error',
      'Failed to load products and categories. Please try again.',
      [{ text: 'Retry', onPress: loadData }]
    );
  } finally {
    setIsLoading(false);
  }
};
```

### 3. **Supabase Tables Required**

Your `database/schema.sql` needs these tables:

#### Categories Table:
```sql
CREATE TABLE categories (
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
```

#### Products Table:
```sql
CREATE TABLE products (
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
  origin_state TEXT DEFAULT 'Tamil Nadu',
  expiry_days INTEGER,
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **ProductService Methods Used**

```typescript
// Get all active categories
getCategories(): Promise<Category[]>

// Get products with filters
getProducts(filters: ProductFilter): Promise<Product[]>
  // Supports:
  // - category filter
  // - search query
  // - price range
  // - organic filter
  // - featured products
  // - in-stock filter
  // - sorting (price, name, rating, popularity)
  // - pagination (limit, offset)

// Get featured products specifically
getFeaturedProducts(limit: number): Promise<Product[]>

// Get products by category
getProductsByCategory(category: string, limit: number): Promise<Product[]>

// Search products
searchProducts(searchTerm: string, limit: number): Promise<Product[]>

// Get similar products
getSimilarProducts(productId: string, category: string, limit: number): Promise<Product[]>

// Get organic products
getOrganicProducts(limit: number): Promise<Product[]>

// Get seasonal products
getSeasonalProducts(limit: number): Promise<Product[]>
```

## Setup Instructions

### Step 1: Ensure Database Schema is Deployed
Make sure your Supabase database has the categories and products tables:

```bash
# In Supabase dashboard, go to SQL Editor and run:
# (Copy from database/schema.sql)
```

### Step 2: Add Sample Data

Insert sample categories:
```sql
INSERT INTO categories (name_en, name_ta, sort_order, is_active) VALUES
  ('Fresh Vegetables', 'புதிய காய்கறிகள்', 1, true),
  ('Fresh Fruits', 'புதிய பழங்கள்', 2, true),
  ('Organic', 'இயற்கை', 3, true),
  ('Dairy', 'பால் பொருள்கள்', 4, true),
  ('Spices', 'மசாலாக்கள்', 5, true),
  ('Rice & Grains', 'அரிசி மற்றும் தானியங்கள்', 6, true);
```

Insert sample featured products:
```sql
INSERT INTO products (
  name_en, name_ta, description_en, category_en, category_ta,
  price, mrp, stock_quantity, unit, is_featured, is_active, tags
) VALUES
  (
    'Organic Tomatoes', 'இயற்கை தக்காளி',
    'Fresh organic tomatoes rich in lycopene',
    'vegetables', 'காய்கறிகள்',
    12.99, 15.99, 50, 'kg', true, true, ARRAY['fresh', 'organic', 'red']
  ),
  (
    'Basmati Rice', 'பாசுமதி அரிசி',
    'Premium quality long-grain basmati rice',
    'grocery', 'பொதுப் பொருட்கள்',
    24.99, 28.99, 200, 'kg', true, true, ARRAY['premium', 'rice', 'aromatic']
  ),
  (
    'Fresh Spinach', 'கீரை', 
    'Organic spinach leaves, iron-rich',
    'vegetables', 'காய்கறிகள்',
    8.50, 10.00, 30, 'bundle', true, true, ARRAY['organic', 'green', 'healthy']
  );
```

### Step 3: Replace HomeScreen Component

Replace the old `src/screens/home/HomeScreen.tsx` with the updated version that includes Supabase integration.

### Step 4: Test the Integration

1. **Start the Expo development server:**
   ```bash
   npx expo start --web --offline --clear
   ```

2. **Monitor console for errors:**
   - Watch for Supabase connection errors
   - Check if categories and products are loading

3. **Test on your platform:**
   - Web: Should show categories and featured products
   - Android: Same functionality
   - iOS: Same functionality

### Step 5: Enable RLS Policies (Security)

For production, add Row Level Security policies to the categories and products tables:

```sql
-- Allow anyone to read active categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Allow anyone to read active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Only admins can modify categories
CREATE POLICY "Only admins can modify categories"
  ON categories FOR ALL
  USING (auth.role() = 'admin');

-- Only admins can modify products
CREATE POLICY "Only admins can modify products"
  ON products FOR ALL
  USING (auth.role() = 'admin');
```

## Features Included

### ✅ Data Loading
- Async loading of categories from Supabase
- Async loading of featured products from Supabase
- Error handling with retry mechanism
- Loading state with spinner

### ✅ Filtering
- Filter by category
- Filter by price range
- Organic products filter
- In-stock filter
- Multiple sorting options (price, name, rating, newest)

### ✅ Refresh Functionality
- Pull-to-refresh to reload data
- Manual retry on error

### ✅ Product Display
- Grid layout (2 columns)
- Product images from Supabase
- Price, ratings, and stock status
- Add to cart functionality

### ✅ Category Display
- Horizontal scrollable categories
- Dynamic emoji assignment based on category name
- Click to filter products by category

## Troubleshooting

### Categories Not Showing
- Check if categories table has data with `is_active = true`
- Verify RLS policies allow reading

### Products Not Showing
- Check if products table has data with `is_active = true`
- Verify `is_featured = true` for featured products
- Check if `stock_quantity > 0`

### Slow Loading
- Check Supabase connection
- Add pagination/limits to reduce data
- Check network in browser DevTools

### Add to Cart Not Working
- Ensure cart service is properly initialized
- Check Redux store configuration
- Verify ProductCard component receives correct props

## Next Steps

1. **Admin Panel**: Create admin interface to manage categories and products in Supabase
2. **Product Details**: Implement full product details page with Supabase data
3. **Search**: Enhance search with Supabase full-text search
4. **Analytics**: Track product views and sales in Supabase
5. **Reviews**: Add product review system backed by Supabase

## Files Modified

- ✅ `src/screens/home/HomeScreen.tsx` - Updated with Supabase integration
- ✅ `lib/services/productService.ts` - Already has all needed methods (no changes)

## Database Files Reference

- Schema: `database/schema.sql`
- Migrations: `database/schema_safe.sql`, `database/schema_ultra_safe.sql`
- Sample data: Create your own or use provided inserts
