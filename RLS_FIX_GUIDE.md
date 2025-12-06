# 🔒 Row Level Security (RLS) Fix Guide

## Problem
You're getting a `403 Forbidden` error when trying to add items to cart:
```
"new row violates row-level security policy for table \"cart_items\""
```

## Solution
Run the RLS policy scripts in Supabase SQL Editor.

---

## 📋 Step-by-Step Instructions

### Option 1: Quick Fix (Cart Items Only)
If you only need to fix the cart functionality:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file: `fix_cart_items_rls.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **"Run"**
6. Verify no errors appear

### Option 2: Complete Fix (All Tables)
To fix all RLS policies for the entire app:

1. Open **Supabase Dashboard** → **SQL Editor**
2. Open the file: `fix_all_rls_policies.sql`
3. Copy the entire contents
4. Paste into SQL Editor
5. Click **"Run"**
6. Verify no errors appear

---

## 🎯 What These Scripts Do

### `fix_cart_items_rls.sql`
- Enables RLS on `cart_items` table
- Allows authenticated users to:
  - ✅ View their own cart items
  - ✅ Add items to their cart
  - ✅ Update quantities in their cart
  - ✅ Remove items from their cart

### `fix_all_rls_policies.sql`
Comprehensive RLS setup for all tables:

| Table | Customer Access | Admin Access |
|-------|----------------|--------------|
| `cart_items` | Own items only | N/A |
| `orders` | Own orders only | All orders |
| `order_items` | Own order items | All order items |
| `addresses` | Own addresses | N/A |
| `users` | Own profile | All users (read) |
| `products` | Read active products | Full CRUD |

---

## ✅ After Running the Scripts

### Test Cart Functionality
1. Log in as a customer
2. Try adding a product to cart
3. Should work without errors ✅

### Test Admin Functionality
1. Log in as admin
2. Should be able to view all orders
3. Should be able to manage products

---

## 🔍 Verification

After running the scripts, you can verify they worked by running this query:

```sql
-- Check RLS policies were created
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'cart_items';
```

You should see 4 policies:
- Users can view their own cart items (SELECT)
- Users can insert their own cart items (INSERT)
- Users can update their own cart items (UPDATE)
- Users can delete their own cart items (DELETE)

---

## 🚨 Important Notes

1. **Authentication Required**: Users must be logged in (authenticated) to use cart functionality
2. **User ID Matching**: The `user_id` in cart_items must match the authenticated user's ID
3. **Admin Access**: Admins have separate policies for viewing all data

---

## 📝 Files Created

- `fix_cart_items_rls.sql` - Quick fix for cart only
- `fix_all_rls_policies.sql` - Complete RLS setup for all tables
- `database_migrations.sql` - Admin users and inventory (run this first if not done)

---

## 🎯 Recommended Order

1. **First**: Run `database_migrations.sql` (for admin features)
2. **Second**: Run `fix_all_rls_policies.sql` (for customer features)
3. **Test**: Try adding items to cart and placing orders

---

## 💡 Troubleshooting

### Still getting 403 errors?
- Make sure you're logged in (authenticated)
- Check that `auth.uid()` returns a valid user ID
- Verify RLS is enabled on the table
- Check the policies were created successfully

### Can't see products?
- Make sure products have `is_active = true`
- Check the "Anyone can view active products" policy exists

### Admin can't access data?
- Verify admin user exists in `admin_users` table
- Check `is_active = true` for the admin user
- Ensure correct `role_id` is set

---

**After running these scripts, your cart and order functionality should work perfectly!** 🎉
