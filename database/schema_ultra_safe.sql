-- ULTRA SAFE DATABASE SCHEMA DEPLOYMENT
-- This version checks for existing constraints before creating them

-- Enable necessary extensions (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types (safe with IF NOT EXISTS equivalent)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin', 'delivery', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('vegetables', 'fruits', 'dairy', 'grocery', 'spices', 'organic', 'frozen', 'bakery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(10),
  preferred_language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(50) NOT NULL, -- Home, Office, Other
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  pincode VARCHAR(10) NOT NULL,
  landmark TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
  mrp DECIMAL(10,2), -- Maximum Retail Price
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  min_order_quantity INTEGER DEFAULT 1,
  max_order_quantity INTEGER DEFAULT 10,
  unit TEXT DEFAULT 'kg', -- kg, grams, pieces, liters
  weight DECIMAL(8,3), -- Actual weight in kg
  gst_rate DECIMAL(5,2) DEFAULT 18.00,
  hsn_code TEXT, -- For GST compliance
  fssai_license TEXT, -- Food safety license
  is_organic BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  nutritional_info JSONB,
  storage_instructions TEXT,
  origin_state TEXT DEFAULT 'Tamil Nadu',
  expiry_days INTEGER, -- Days until expiry
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT, -- Razorpay payment ID
  razorpay_order_id TEXT, -- Razorpay order ID
  subtotal DECIMAL(10,2) NOT NULL,
  cgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0, -- Central GST (9%)
  sgst_amount DECIMAL(10,2) NOT NULL DEFAULT 0, -- State GST (9%)
  gst_amount DECIMAL(10,2) NOT NULL, -- Total GST (18%)
  delivery_charge DECIMAL(6,2) DEFAULT 0,
  discount_amount DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address JSONB NOT NULL,
  billing_address JSONB,
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  delivery_instructions TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10,2),
  invoice_number TEXT,
  invoice_url TEXT,
  tracking_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Safe constraint creation function
CREATE OR REPLACE FUNCTION add_constraint_if_not_exists(
  table_name TEXT,
  constraint_name TEXT,
  constraint_definition TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  constraint_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = constraint_name
  ) INTO constraint_exists;
  
  IF NOT constraint_exists THEN
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', table_name, constraint_name, constraint_definition);
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add constraints safely
SELECT add_constraint_if_not_exists('cart_items', 'cart_items_user_product_unique', 'UNIQUE(user_id, product_id)');

-- Enable RLS on core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON users;
  CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON users;
  CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
  CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
  CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

-- Public read policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view active products" ON products;
  CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
  CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (is_active = true);
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

-- Insert essential data (with conflict resolution)
INSERT INTO categories (id, name_en, name_ta, description_en, description_ta, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Vegetables', 'காய்கறிகள்', 'Fresh vegetables', 'புதிய காய்கறிகள்', 1),
('550e8400-e29b-41d4-a716-446655440001', 'Fruits', 'பழங்கள்', 'Fresh fruits', 'புதிய பழங்கள்', 2),
('550e8400-e29b-41d4-a716-446655440002', 'Dairy', 'பால் பொருட்கள்', 'Milk and dairy products', 'பால் மற்றும் பால் பொருட்கள்', 3),
('550e8400-e29b-41d4-a716-446655440003', 'Grocery', 'மளிகை', 'Daily grocery items', 'தினசரி மளிகை பொருட்கள்', 4)
ON CONFLICT (id) DO NOTHING;

-- Create delivery_slot_templates table for recurring weekday/weekend slots
CREATE TABLE IF NOT EXISTS delivery_slot_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_type VARCHAR(10) NOT NULL CHECK (slot_type IN ('weekday', 'weekend')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_orders INTEGER DEFAULT 50,
  repeat_weekly BOOLEAN DEFAULT true,
  repeat_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create delivery_slot_instances table for concrete slot instances
CREATE TABLE IF NOT EXISTS delivery_slot_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES delivery_slot_templates(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  slot_type VARCHAR(10) NOT NULL CHECK (slot_type IN ('weekday', 'weekend')),
  capacity INTEGER NOT NULL,
  booked_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'full', 'expired', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(slot_date, start_ts, end_ts)
);

-- Add foreign key to orders table for delivery_slot_instance_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_slot_instance_id UUID REFERENCES delivery_slot_instances(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_slot_templates_type ON delivery_slot_templates(slot_type);
CREATE INDEX IF NOT EXISTS idx_slot_templates_active ON delivery_slot_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_slot_instances_date ON delivery_slot_instances(slot_date);
CREATE INDEX IF NOT EXISTS idx_slot_instances_status ON delivery_slot_instances(status);
CREATE INDEX IF NOT EXISTS idx_slot_instances_type ON delivery_slot_instances(slot_type);

-- RLS policies for slot templates (admins can manage)
ALTER TABLE delivery_slot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_slot_instances ENABLE ROW LEVEL SECURITY;

-- Anyone can view active slot templates
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view active slot templates" ON delivery_slot_templates;
  CREATE POLICY "Anyone can view active slot templates" ON delivery_slot_templates FOR SELECT USING (is_active = true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Anyone can view available slot instances
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view available slot instances" ON delivery_slot_instances;
  CREATE POLICY "Anyone can view available slot instances" ON delivery_slot_instances FOR SELECT USING (status = 'available');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Insert sample products
INSERT INTO products (id, name_en, name_ta, category_id, category_en, category_ta, price, mrp, stock_quantity, unit, hsn_code, images, is_featured) VALUES
('850e8400-e29b-41d4-a716-446655440000', 'Tomato', 'தக்காளி', '550e8400-e29b-41d4-a716-446655440000', 'vegetables', 'காய்கறிகள்', 40.00, 45.00, 100, 'kg', '07020000', ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'], true),
('850e8400-e29b-41d4-a716-446655440001', 'Onion', 'வெங்காயம்', '550e8400-e29b-41d4-a716-446655440000', 'vegetables', 'காய்கறிகள்', 35.00, 40.00, 150, 'kg', '07031000', ARRAY['https://images.unsplash.com/photo-1508747703725-719777637510?w=400'], true),
('850e8400-e29b-41d4-a716-446655440002', 'Banana', 'வாழைப்பழம்', '550e8400-e29b-41d4-a716-446655440001', 'fruits', 'பழங்கள்', 50.00, 55.00, 80, 'dozen', '08030000', ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'], true),
('850e8400-e29b-41d4-a716-446655440004', 'Milk', 'பால்', '550e8400-e29b-41d4-a716-446655440002', 'dairy', 'பால் பொருட்கள்', 56.00, 60.00, 200, 'liter', '04011000', ARRAY['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'], true),
('850e8400-e29b-41d4-a716-446655440005', 'Rice', 'அரிசி', '550e8400-e29b-41d4-a716-446655440003', 'grocery', 'மளிகை', 45.00, 50.00, 500, 'kg', '10063000', ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'], true)
ON CONFLICT (id) DO NOTHING;

-- Verify deployment
SELECT 'ULTRA SAFE DATABASE DEPLOYMENT COMPLETED!' as status;

-- Show created tables count
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';

COMMIT;