# Cleanup Plan

## 1. Completed Tasks

### Deleted Files
- ✅ API Services
  - `lib/services/api/*` (All files in this directory)

- ✅ Redux Actions
  - `lib/store/actions/supabaseAuthActions.ts`
  - `lib/store/actions/authActions.ts`
  - `lib/store/actions/productActions.ts`

### Updated Files
- ✅ App.tsx - Updated Redux store import to use Supabase store
  ```typescript
  import { persistor, store } from './lib/supabase/store';
  ```

- ✅ src/screens/cart/CartScreen.tsx - Updated imports and function calls
  - Old: `import { checkSupabaseSession, supabaseLoginUser } from '../../../lib/store/actions/supabaseAuthActions';`
  - New: `import { checkSession, loginUser } from '../../../lib/supabase/store/actions/authActions';`
  - Updated function calls in the file

- ✅ login-handler-patch.js - Updated reference code
  - Old: `import { supabaseLoginUser, checkSupabaseSession } from '../../../lib/store/actions/supabaseAuthActions';`
  - New: `import { loginUser, checkSession } from '../../../lib/supabase/store/actions/authActions';`

## 2. Remaining Tasks

### Files to Delete
- ✅ `constants/FirebaseConfig.ts` - Firebase configuration file has been deleted

### Components to Update
- ❌ Search for components using imports from old Redux structure and update them:
  ```
  grep -r "from '.*lib/store/" --include="*.tsx" --include="*.ts" src/
  ```

### Dependencies to Remove
- ✅ Removed Firebase dependencies:
  ```json
  "@react-native-firebase/app": "^22.2.1",
  "@react-native-firebase/analytics": "^22.2.1", 
  "@react-native-firebase/crashlytics": "^22.2.1",
  "@react-native-firebase/messaging": "^22.2.1"
  ```

## 3. Testing Checklist
After completing all tasks:
- [ ] Authentication (sign up, sign in, sign out)
- [ ] Product listing and filtering
- [ ] Cart operations
- [ ] Checkout process
- [ ] Order history
- [ ] Profile management

## 4. Progress Summary
- Files deleted: 17
- Files updated: 5
- Files remaining to update: Some components still using old Redux paths (delivery, admin)
- Dependencies: All Firebase dependencies successfully removed