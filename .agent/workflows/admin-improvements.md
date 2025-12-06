---
description: Admin Panel Improvements Implementation Plan
---

# Admin Panel Improvements - Implementation Plan

## Task 1: Fix Admin Order Details Location Display
**Issue**: Clicking the location icon doesn't display the customer location
**Location**: `src/screens/admin/AdminOrderDetailsScreen.tsx` (line 330)
**Solution**: Implement `handleViewMap` function to open Google Maps with the delivery address coordinates

## Task 2: Replace Logo Everywhere
**File**: `C:\Users\sridh\Downloads\Daily Fresh Hosur\assets\branding\Fresh_From_Hosur_Farms.png`
**Files to Update**:
- `src/screens/SplashScreen.tsx` - Replace emoji with image
- `src/screens/auth/WelcomeScreen.tsx` - Replace emoji with image
- `src/screens/auth/RegisterScreen.tsx` - Update DailyFreshLogo component
- `src/screens/auth/OnboardingScreen.tsx` - Update DailyFreshLogo component
- `src/components/branding/DailyFreshLogo.tsx` - Update to use new logo file

## Task 3: Create Admin Inventory Management UX
**File**: `src/screens/admin/InventoryScreen.tsx`
**Status**: Already implemented with full UX
**Features**:
- Stock statistics dashboard
- Search and filter functionality
- Category filters
- Stock status filters (Low Stock, Out of Stock, Active, Inactive)
- Update stock modal
- Toggle product status
- Export functionality (placeholder)

## Task 4: Create Admin User Management UX
**File**: `src/screens/admin/UserManagementScreen.tsx`
**Status**: Already implemented with full UX
**Features**:
- User list with search
- Add new admin user modal
- Edit user modal
- Toggle user active status
- Delete user with confirmation
- Role-based permissions
- Last login tracking

## Implementation Order:
1. Fix location display (Quick fix)
2. Replace logo everywhere (Medium effort)
3. Verify Inventory UX is working (Already done)
4. Verify User Management UX is working (Already done)
