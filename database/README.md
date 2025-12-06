# Daily Fresh Hosur - Database Documentation

## Overview
This folder contains all database-related files for the Daily Fresh Hosur application, which uses **Supabase (PostgreSQL)** as the backend database.

---

## 📁 Folder Structure

```
database/
├── README.md                           # This documentation file
├── schemas/
│   ├── core/
│   │   ├── 01_extensions.sql          # PostgreSQL extensions (uuid-ossp, postgis)
│   │   ├── 02_enums.sql               # Custom ENUM types
│   │   ├── 03_users.sql               # Users and authentication tables
│   │   ├── 04_addresses.sql           # User addresses table
│   │   └── 05_cart.sql                # Cart items table
│   ├── products/
│   │   ├── 01_categories.sql          # Product categories
│   │   ├── 02_products.sql            # Products table with Tamil support
│   │   └── 03_inventory.sql           # Inventory tracking
│   ├── orders/
│   │   ├── 01_orders.sql              # Orders table
│   │   ├── 02_order_items.sql         # Order items table
│   │   └── 03_order_history.sql       # Order status history
│   ├── delivery/
│   │   ├── 01_delivery_areas.sql      # Delivery zones
│   │   ├── 02_delivery_slots.sql      # Delivery time slots
│   │   └── 03_slot_templates.sql      # Recurring slot templates
│   └── promotions/
│       ├── 01_coupons.sql             # Coupons and discounts
│       ├── 02_banners.sql             # Promotional banners
│       └── 03_notifications.sql       # User notifications
├── functions/
│   ├── order_functions.sql            # Order-related functions
│   ├── product_functions.sql          # Product rating and review functions
│   └── utility_functions.sql          # General utility functions
├── policies/
│   ├── rls_policies.sql               # Row Level Security policies
│   └── admin_policies.sql             # Admin-specific policies
├── seeds/
│   ├── categories.sql                 # Default categories (Tamil & English)
│   ├── products.sql                   # Sample products
│   ├── delivery_areas.sql             # Default delivery areas (Hosur region)
│   ├── delivery_slots.sql             # Default delivery slots
│   └── app_settings.sql               # App configuration settings
├── migrations/
│   └── (version-controlled migrations)
├── scripts/
│   ├── admin-user-management.sql      # Admin user setup scripts
│   ├── sync-existing-users.sql        # User synchronization
│   └── emergency-admin-fix.sql        # Emergency fixes
└── legacy/
    ├── schema.sql                     # Original full schema (reference)
    ├── schema_safe.sql                # Safe deployment version
    └── schema_ultra_safe.sql          # Ultra-safe with constraint checks
```

---

## 🗄️ Database Schema Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | Extends Supabase auth.users with profile data |
| `user_addresses` | Multiple delivery addresses per user |
| `cart_items` | Shopping cart with product references |
| `products` | Product catalog with Tamil support |
| `categories` | Hierarchical product categories |
| `orders` | Order records with GST calculations |
| `order_items` | Line items for each order |
| `order_status_history` | Audit trail for order changes |

### Delivery Tables

| Table | Description |
|-------|-------------|
| `delivery_areas` | Geographic delivery zones with PostGIS |
| `delivery_slots` | Available time slots for delivery |
| `delivery_slot_templates` | Recurring weekday/weekend slot patterns |
| `delivery_slot_instances` | Concrete slot instances with capacity |

### Promotional Tables

| Table | Description |
|-------|-------------|
| `coupons` | Discount codes and offers |
| `coupon_usage` | Track coupon utilization |
| `banners` | Home screen promotional banners |
| `notifications` | Push notification records |

### Support Tables

| Table | Description |
|-------|-------------|
| `product_reviews` | Customer reviews with ratings |
| `user_favorites` | Wishlist/saved products |
| `vendors` | Supplier management |
| `inventory_logs` | Stock movement tracking |
| `app_settings` | Application configuration |

---

## 🔄 Custom Types (ENUMs)

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'delivery', 'vendor');

-- Order lifecycle
CREATE TYPE order_status AS ENUM (
  'pending', 
  'confirmed', 
  'preparing', 
  'out_for_delivery', 
  'delivered', 
  'cancelled'
);

-- Payment states
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Product categories
CREATE TYPE product_category AS ENUM (
  'vegetables', 
  'fruits', 
  'dairy', 
  'grocery', 
  'spices', 
  'organic', 
  'frozen', 
  'bakery'
);
```

---

## 🔐 Row Level Security (RLS)

All sensitive tables have RLS enabled:

- **Users**: Can only view/update their own profile
- **Cart**: Users manage only their own cart
- **Orders**: Users see only their own orders
- **Products**: Everyone can view active products
- **Admin**: Full access via role-based policies

---

## 🚀 Quick Deployment

### Option 1: Full Schema (Fresh Database)
```sql
-- Run the complete schema
\i database/schema.sql
```

### Option 2: Safe Deployment (Existing Database)
```sql
-- Use ultra-safe version with IF NOT EXISTS checks
\i database/schema_ultra_safe.sql
```

---

## 📊 Key Features

### 1. Multi-language Support (Tamil & English)
- All product-facing tables include `_en` and `_ta` columns
- Categories, products, banners, notifications support both languages

### 2. GST Compliance
- Orders include CGST (9%) and SGST (9%) breakdown
- Products have HSN codes for tax filing
- FSSAI license tracking for food products

### 3. Delivery Slot System
- Template-based recurring slots (weekday/weekend)
- Capacity management with booking counts
- Real-time availability updates

### 4. PostGIS Integration
- Geospatial delivery area boundaries
- Distance-based delivery calculations
- Location-based filtering

---

## 🔧 Maintenance Scripts

| Script | Purpose |
|--------|---------|
| `admin-user-management.sql` | Create/manage admin accounts |
| `sync-existing-users.sql` | Sync auth.users to public.users |
| `emergency-admin-fix.sql` | Reset admin access in emergencies |
| `fix-category-products.sql` | Repair category-product relationships |

---

## 📝 Notes

1. Always backup before running migrations
2. Use `schema_ultra_safe.sql` for production deployments
3. Test RLS policies after any schema changes
4. Keep migration versioning consistent

---

## 🔗 Related Documentation

- [Supabase Integration Guide](../SUPABASE_INTEGRATION_GUIDE.md)
- [Backend Migration Analysis](../BACKEND_MIGRATION_ANALYSIS.md)
- [Delivery Slot Implementation](../DELIVERY_SLOT_IMPLEMENTATION.md)
