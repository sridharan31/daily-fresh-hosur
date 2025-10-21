# Daily Fresh Hosur - Supabase Implementation

This project has been fully migrated to use Supabase for backend functionality, replacing the previous Node.js API.

## Architecture Overview

The application now follows a clean architecture pattern with proper separation of concerns:

```
lib/
  supabase/
    client.ts                  # Supabase client configuration
    schema/
      types.ts                # Database type definitions
    services/                  # Service layer for Supabase
      auth.ts                 # Authentication services
      product.ts              # Product services
      cart.ts                 # Cart services
      order.ts                # Order services
      index.ts                # Service exports
    store/                     # Redux store for Supabase
      actions/                # Redux actions
        authActions.ts        # Auth actions
        productActions.ts     # Product actions
        cartActions.ts        # Cart actions
        orderActions.ts       # Order actions
      authSlice.ts            # Auth state management
      productSlice.ts         # Product state management
      cartSlice.ts            # Cart state management
      orderSlice.ts           # Order state management
      rootReducer.ts          # Root reducer
      index.ts                # Store configuration
```

## Key Features

1. **Type Safety**
   - Full TypeScript definitions for database schema
   - Type-safe Supabase client
   - Properly typed Redux store

2. **Authentication**
   - Email/password authentication
   - Session management
   - User profiles
   - Role-based permissions

3. **Data Management**
   - Products and categories
   - Bilingual support (English/Tamil)
   - Cart functionality
   - Order processing
   - Real-time updates

4. **State Management**
   - Redux for state management
   - Persistent storage with redux-persist
   - Optimized state updates

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

3. Run the application:
```bash
npx expo start
```

## Migration Notes

If you're coming from the previous Node.js version:
- Authentication now uses Supabase Auth instead of custom JWT
- Data fetching uses Supabase Client instead of Axios
- Real-time updates are available using Supabase subscriptions
- Types are now generated from the database schema

## Usage Example

```typescript
// Authentication
import { authService } from 'lib/supabase/services';

// Login
const result = await authService.signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Products
import { productService } from 'lib/supabase/services';

// Get products
const products = await productService.getProducts({
  category: 'Vegetables',
  sortBy: 'price_asc',
  inStock: true
});
```