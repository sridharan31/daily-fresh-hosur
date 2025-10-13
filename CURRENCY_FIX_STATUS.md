# 🚨 API 500 Error and Currency Fix

## Issues Found:
1. **500 API Error**: Database schema not deployed to Supabase
2. **Currency**: Still showing AED instead of INR
3. **Tax**: Still showing VAT instead of GST
4. **Phone Format**: UAE format (+971) instead of Indian (+91)

## Quick Fix Steps:

### 1. Deploy Database Schema (CRITICAL)
The 500 error is because the `users` table doesn't exist in your Supabase database.

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: "Daily Fresh Hosur"
3. Go to **SQL Editor**
4. Copy the contents of `database/schema_safe.sql`
5. Paste and click **"Run"**

### 2. Test User Insert
After deploying schema, run this in SQL Editor:
```sql
-- Copy contents of test-user-insert.sql and run it
```

### 3. Currency & Tax Fixed ✅
I've updated the configuration files:
- ✅ `environment.ts`: AED → INR, VAT → GST
- ✅ `index.ts`: UAE settings → India settings  
- ✅ `constants.ts`: AED → INR, Emirates → Tamil Nadu districts
- ✅ `helpers.ts`: Price formatting uses Indian format

## Fixed Values:

### Before (AED/UAE):
```typescript
DEFAULT_CURRENCY: 'AED'
VAT_RATE: 0.05  // 5% VAT
FREE_DELIVERY_THRESHOLD: 100  // AED
EXPRESS_DELIVERY_CHARGE: 15   // AED
PHONE_CODE: '+971'
```

### After (INR/India):
```typescript
DEFAULT_CURRENCY: 'INR'
VAT_RATE: 0.18  // 18% GST
FREE_DELIVERY_THRESHOLD: 500  // INR
EXPRESS_DELIVERY_CHARGE: 50   // INR
PHONE_CODE: '+91'
```

## Test the Fix:

### 1. Deploy Schema First
```bash
# Go to Supabase Dashboard → SQL Editor
# Run: database/schema_safe.sql
```

### 2. Test User Creation
```bash
# Run: test-user-insert.sql in SQL Editor
```

### 3. Test API Call
Your curl command should work after schema deployment:
```bash
curl 'https://yvjxgoxrzkcjvuptblri.supabase.co/rest/v1/users' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --data-raw '{"id":"...","email":"justinsridhar@gmail.com","phone":"+919876543210",...}'
```

### 4. Check Currency Display
- Prices should show: ₹100.00 (INR format)
- Tax should show: GST 18%
- Delivery: ₹25 standard, ₹50 express

## Root Cause:
The 500 error happens because you're trying to insert into a `users` table that doesn't exist yet. The database schema needs to be deployed first.

**Priority**: Deploy the database schema immediately to fix the 500 error!