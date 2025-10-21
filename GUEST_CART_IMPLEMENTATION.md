# Guest Cart Implementation Guide

This document outlines the implementation of guest cart functionality for Daily Fresh Hosur app, which allows non-authenticated users to add items to cart and checkout.

## Overview

The guest cart functionality provides a seamless shopping experience for users who are not logged in. It maintains cart state locally in Redux store and allows for guest checkout by collecting delivery information at checkout time.

## Key Components

### 1. useCart Hook Enhancements

The `useCart` hook has been enhanced to support both authenticated and guest users:

- **Authentication Detection**: The hook checks for authentication status and provides appropriate functionality
- **Local Cart Management**: For guest users, cart state is managed in Redux without requiring Supabase
- **Unified Interface**: The same cart functions work for both guest and authenticated users

### 2. Cart Actions for Guest Users

For guest users, we've implemented the following actions:

- `addItem`: Adds products to local cart with unique local IDs
- `removeItem`: Removes products from local cart
- `updateItemQuantity`: Updates quantity of items in local cart  
- `clearAllItems`: Clears the entire local cart

### 3. Guest Checkout Flow

The checkout experience has been enhanced with:

- **Guest Checkout Form**: A dedicated form to collect guest delivery information
- **Account Creation Option**: Prompts guests if they want to create an account during checkout
- **Address Management**: Displays guest address information during checkout

### 4. Cart Synchronization

When a guest user logs in:

- Their local cart items are preserved
- The UI is updated to show authentication-specific features
- When checking out, the appropriate flow is used based on authentication status

## Implementation Details

### Local Cart Structure

Guest cart items use the following structure:

```typescript
{
  id: `local-${Date.now()}`,  // Unique local ID
  product_id: product.id,     // Product ID from database
  user_id: 'guest',           // Indicates guest cart
  quantity: quantity,         // Item quantity
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  product: product            // Full product object
}
```

### Redux Integration

For guest users, we dispatch "fake" Redux actions that mimic the authenticated flow:

```typescript
dispatch({ 
  type: 'cart/addToCart/fulfilled', 
  payload: [...safeItems, newItem] 
});
```

This ensures the cart reducer works for both authenticated and guest users.

## Benefits

1. **Seamless Experience**: Users can shop without creating an account first
2. **Reduced Friction**: Removing login requirement increases conversion rates
3. **Smooth Transition**: If a guest decides to log in, their cart is maintained
4. **Compatibility**: Works with existing code and doesn't break authenticated flows

## Future Improvements

1. Implement local storage persistence for guest carts
2. Add functionality to merge guest cart with user cart after login
3. Enhance analytics tracking for guest cart conversion rates