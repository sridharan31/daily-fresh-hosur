# Address Submission Fix Guide

## Problem Summary

The application was encountering a 403 Forbidden error when attempting to add or update user addresses in Supabase. This error was caused by:

1. Mismatched field names between frontend and database schema
2. Improper handling of user authentication in address operations
3. Issues with Row Level Security (RLS) policies in Supabase

## Files Modified

1. `lib/utils/addressUtils.ts` - Fixed mapping between frontend and backend address formats
2. `lib/supabase/services/user.ts` - Updated address operations with proper authentication
3. `app/checkout.tsx` - Updated address submission in checkout flow

## Key Changes

### 1. Address Mapping

We fixed the field mapping in `addressUtils.ts` to match the actual Supabase database schema:

```typescript
// Frontend Address format
interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  landmark?: string;
  isDefault?: boolean;
}

// Database schema
interface UserAddress {
  id: string;
  user_id: string;
  title: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
```

### 2. Authentication & User ID

We now properly authenticate users before any address operation and ensure the `user_id` field is correctly set:

```typescript
// Before each address operation
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  throw new Error('Authentication required');
}

// Then include user_id in operations
const { data, error } = await supabase
  .from('user_addresses')
  .insert({
    ...supabaseAddress,
    user_id: user.id
  });
```

### 3. Row Level Security Considerations

When working with Supabase and RLS policies, keep in mind:

1. The authenticated user token must match the user_id in operations
2. The endpoint (URL) must be accessed with proper authorization headers
3. RLS policies must allow the specific operation (INSERT, UPDATE, DELETE) for the user

## Testing

To test if the address functionality now works:

1. Log in with valid credentials
2. Navigate to the checkout page
3. Add or edit an address 
4. Verify that the address is saved without 403 errors

## Future Improvements

1. Implement better error handling for address operations
2. Add validation checks before submitting to Supabase
3. Consider implementing offline support for address storage

## Conclusion

This fix addresses the 403 error by ensuring proper authentication, field mapping, and respecting Supabase's RLS policies. The application should now correctly save and retrieve user addresses.