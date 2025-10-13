-- Daily Fresh Hosur E-commerce Database Schema
-- Complete migration from Firebase/MongoDB to Supabase PostgreSQL

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'delivery', 'vendor');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE product_category AS ENUM ('vegetables', 'fruits', 'dairy', 'grocery', 'spices', 'organic', 'frozen', 'bakery');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
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
CREATE TABLE user_addresses (
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

-- Products table with Tamil support
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

-- Delivery areas for Tamil Nadu
CREATE TABLE delivery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  district TEXT NOT NULL, -- Chennai, Coimbatore, Madurai, etc.
  pincode INTEGER[],
  geometry GEOGRAPHY(POLYGON), -- PostGIS for area boundaries
  delivery_charge DECIMAL(6,2) DEFAULT 0,
  free_delivery_threshold DECIMAL(8,2) DEFAULT 500,
  min_order_amount DECIMAL(8,2) DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery slots
CREATE TABLE delivery_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER DEFAULT 50,
  booked_slots INTEGER DEFAULT 0,
  delivery_charge DECIMAL(6,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  area_id UUID REFERENCES delivery_areas(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cart items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
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
  delivery_slot_id UUID REFERENCES delivery_slots(id),
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

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- Store name at time of order
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL, -- Price at time of order
  total DECIMAL(10,2) NOT NULL,
  gst_rate DECIMAL(5,2) DEFAULT 18.00,
  hsn_code TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order status history
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coupons and discounts
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  description_en TEXT,
  description_ta TEXT,
  discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed', 'free_delivery')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  user_limit INTEGER DEFAULT 1, -- Per user usage limit
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  applicable_categories UUID[],
  applicable_products UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Coupon usage tracking
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, order_id)
);

-- Wishlist/Favorites
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_ta TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- order_update, promotion, system
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- App settings
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor/Supplier management (for future expansion)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone VARCHAR(15),
  email VARCHAR(255),
  address TEXT,
  gst_number VARCHAR(15),
  bank_details JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product inventory tracking
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('purchase', 'sale', 'adjustment', 'expired')),
  quantity_change INTEGER NOT NULL,
  old_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID, -- Order ID for sales, Purchase ID for stock
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Banner/Advertisement management
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_type VARCHAR(20) CHECK (link_type IN ('product', 'category', 'external', 'none')),
  position VARCHAR(20) DEFAULT 'home_top',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category_en);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_delivery_slots_date ON delivery_slots(date);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own addresses
CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

-- Cart management
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Order management
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items (view only for customers)
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Product reviews
CREATE POLICY "Users can view approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can view own reviews" ON product_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Favorites
CREATE POLICY "Users can view own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own favorites" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Public read access for certain tables
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view delivery areas" ON delivery_areas FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view available delivery slots" ON delivery_slots FOR SELECT USING (is_available = true);
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true AND valid_from <= NOW() AND valid_until >= NOW());
CREATE POLICY "Anyone can view active banners" ON banners FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until >= NOW()));
CREATE POLICY "Anyone can view app settings" ON app_settings FOR SELECT;

-- Admin policies (to be implemented based on role)
CREATE POLICY "Admins can do everything" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Functions for common operations

-- Calculate GST for order
CREATE OR REPLACE FUNCTION calculate_order_gst(order_id UUID)
RETURNS TABLE(
  subtotal DECIMAL(10,2),
  cgst_amount DECIMAL(10,2),
  sgst_amount DECIMAL(10,2),
  total_gst DECIMAL(10,2),
  total_amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(oi.quantity * oi.price)::DECIMAL(10,2) as subtotal,
    SUM(oi.quantity * oi.price * 0.09)::DECIMAL(10,2) as cgst_amount,
    SUM(oi.quantity * oi.price * 0.09)::DECIMAL(10,2) as sgst_amount,
    SUM(oi.quantity * oi.price * 0.18)::DECIMAL(10,2) as total_gst,
    SUM(oi.quantity * oi.price * 1.18)::DECIMAL(10,2) as total_amount
  FROM order_items oi
  WHERE oi.order_id = $1;
END;
$$ LANGUAGE plpgsql;

-- Update product rating after review
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0)
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = true
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
  AFTER INSERT OR UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_rating();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data

-- Default categories with Tamil support
INSERT INTO categories (name_en, name_ta, description_en, description_ta, sort_order) VALUES
('Vegetables', 'காய்கறிகள்', 'Fresh vegetables', 'புதிய காய்கறிகள்', 1),
('Fruits', 'பழங்கள்', 'Fresh fruits', 'புதிய பழங்கள்', 2),
('Dairy', 'பால் பொருட்கள்', 'Milk and dairy products', 'பால் மற்றும் பால் பொருட்கள்', 3),
('Grocery', 'மளிகை', 'Daily grocery items', 'தினசரி மளிகை பொருட்கள்', 4),
('Spices', 'மசாலா', 'Spices and condiments', 'மசாலா பொருட்கள்', 5),
('Organic', 'இயற்கை', 'Organic products', 'இயற்கை பொருட்கள்', 6);

-- Default delivery areas for Tamil Nadu
INSERT INTO delivery_areas (name_en, name_ta, district, pincode, delivery_charge, free_delivery_threshold) VALUES
('Hosur Central', 'ஓசூர் மையம்', 'Krishnagiri', ARRAY[635109, 635110, 635126], 0, 500),
('Bagalur', 'பாகலூர்', 'Krishnagiri', ARRAY[635109], 25, 500),
('Denkanikottai', 'தென்கானிக்கோட்டை', 'Krishnagiri', ARRAY[635114, 635115], 40, 750);

-- Default delivery slots
INSERT INTO delivery_slots (date, start_time, end_time, capacity) VALUES
(CURRENT_DATE + INTERVAL '1 day', '08:00', '12:00', 50),
(CURRENT_DATE + INTERVAL '1 day', '16:00', '20:00', 50),
(CURRENT_DATE + INTERVAL '2 days', '08:00', '12:00', 50),
(CURRENT_DATE + INTERVAL '2 days', '16:00', '20:00', 50);

-- Default app settings
INSERT INTO app_settings (key, value, description) VALUES
('min_order_amount', '100', 'Minimum order amount in INR'),
('free_delivery_threshold', '500', 'Free delivery threshold in INR'),
('gst_rate', '18', 'GST rate percentage'),
('delivery_charges', '{"standard": 25, "express": 50}', 'Delivery charges'),
('app_version', '{"android": "1.0.0", "ios": "1.0.0"}', 'Current app versions'),
('maintenance_mode', 'false', 'App maintenance mode'),
('supported_payment_methods', '["upi", "card", "netbanking", "wallet", "cod"]', 'Supported payment methods'),
('currency', '{"code": "INR", "symbol": "₹"}', 'Currency settings'),
('languages', '["en", "ta"]', 'Supported languages');

-- Sample products with Tamil support (you can add more)
INSERT INTO products (name_en, name_ta, category_en, category_ta, price, mrp, stock_quantity, unit, hsn_code, images) VALUES
('Tomato', 'தக்காளி', 'vegetables', 'காய்கறிகள்', 40.00, 45.00, 100, 'kg', '07020000', ARRAY['https://example.com/tomato.jpg']),
('Onion', 'வெங்காயம்', 'vegetables', 'காய்கறிகள்', 35.00, 40.00, 150, 'kg', '07031000', ARRAY['https://example.com/onion.jpg']),
('Banana', 'வாழைப்பழம்', 'fruits', 'பழங்கள்', 50.00, 55.00, 80, 'dozen', '08030000', ARRAY['https://example.com/banana.jpg']),
('Apple', 'ஆப்பிள்', 'fruits', 'பழங்கள்', 180.00, 200.00, 50, 'kg', '08081000', ARRAY['https://example.com/apple.jpg']),
('Milk', 'பால்', 'dairy', 'பால் பொருட்கள்', 56.00, 60.00, 200, 'liter', '04011000', ARRAY['https://example.com/milk.jpg']),
('Rice', 'அரிசி', 'grocery', 'மளிகை', 45.00, 50.00, 500, 'kg', '10063000', ARRAY['https://example.com/rice.jpg']);

COMMIT;