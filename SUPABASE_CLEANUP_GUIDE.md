# Daily Fresh Hosur Supabase Migration Cleanup Guide

This document outlines the steps to clean up the codebase after migrating from Node.js backend to Supabase.

## 1. Files to Remove

The following files are no longer needed and can be safely deleted:

### API Services
- `lib/services/api/apiClient.ts` ✓
- `lib/services/api/authService.ts` ✓
- `lib/services/api/cartService.ts` ✓
- `lib/services/api/orderService.ts` ✓
- `lib/services/api/productService.ts` ✓
- `lib/services/api/userService.ts` ✓
- `lib/services/api/adminService.ts` ✓
- `lib/services/api/deliveryService.ts` ✓
- `lib/services/api/notificationService.ts` ✓
- `lib/services/api/paymentService.ts` ✓
- `lib/services/api/reviewService.ts` ✓
- `lib/services/api/supabaseOrderService.ts` ✓
- `lib/services/api/index.ts` ✓

### Legacy Redux Actions
- `lib/store/actions/supabaseAuthActions.ts` ✓ (replaced by `lib/supabase/store/actions/authActions.ts`)
- `lib/store/actions/authActions.ts` ✓ (replaced by `lib/supabase/store/actions/authActions.ts`)
- `lib/store/actions/productActions.ts` ✓ (replaced by `lib/supabase/store/actions/productActions.ts`)

### Config Files
- `constants/FirebaseConfig.ts`

## 2. Files to Update

The following files need to be updated to reference the new Supabase structure:

### App Entry Point
- `App.tsx` - Update Redux store import to use Supabase store

### Component Updates
- Update all components that use Redux actions to import from the new structure
- Update all API calls to use Supabase services

### Navigation
- Update authentication checks to use Supabase auth services

## 3. Migration Steps

1. Install the Redux DevTools extension for debugging
2. Run the app with Supabase integration
3. Verify all functionality works with Supabase
4. Remove legacy files and dependencies
5. Update imports to use the new structure

## 4. Dependencies to Remove

The following dependencies are no longer needed:

```json
{
  "dependencies": {
    "@react-native-firebase/app": "^22.2.1",
    "@react-native-firebase/analytics": "^22.2.1",
    "@react-native-firebase/crashlytics": "^22.2.1",
    "@react-native-firebase/messaging": "^22.2.1"
  }
}
```

## 5. New Development Workflow

1. Use Supabase Dashboard for database management
2. Use the Supabase CLI for migrations
3. Test all changes using the Supabase local development environment
4. Deploy using the updated deployment process

## 6. Testing Checklist

- [x] Update App.tsx to use Supabase store
- [x] Delete legacy API services
- [x] Delete legacy Redux actions
- [x] Delete Firebase config
- [x] Update components using old Redux paths (Header, AdminLogoutModal, Checkout)
- [x] Remove Firebase dependencies
- [ ] Authentication (sign up, sign in, sign out)
- [ ] Product listing and filtering
- [ ] Cart operations
- [ ] Checkout process
- [ ] Order history
- [ ] Profile management