# Admin Order Management System - UX Requirements
## React Native Mobile App with Supabase

---

## 1. Overview
This document outlines the complete UX requirements for an admin order management system where administrators can view, manage, and update order statuses for customer orders.

---

## 2. User Flow & Navigation

### 2.1 Main Navigation Structure

> **Note:** This navigation structure reflects the actual implementation in `src/navigation/AdminNavigator.tsx`

#### Navigation Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ADMIN NAVIGATION HIERARCHY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📱 AdminStackNavigator (Main Entry Point)                                   │
│  └── AdminTabs ─────────────────────────────────────────────────────────────┤
│      │                                                                       │
│      ├── 🎛️ AdminDrawerNavigator (Side Menu)                                │
│      │   ├── Main ──────► AdminTabNavigator (Bottom Tabs)                   │
│      │   ├── Profile ───► AdminProfileScreen                                │
│      │   ├── Settings ──► AdminSettingsScreen                               │
│      │   ├── SlotManagement ► SlotManagementScreen                          │
│      │   └── Reports ───► AnalyticsScreen                                   │
│      │                                                                       │
│      └── 📊 AdminTabNavigator (Bottom Tab Bar)                              │
│          ├── Dashboard ──► AdminDashboardScreen                             │
│          ├── Products ───► ProductManagementScreen                          │
│          ├── Orders ─────► OrderManagementScreen                            │
│          ├── Customers ──► CustomerManagementScreen                         │
│          ├── Inventory ──► InventoryScreen                                  │
│          └── AdminUsers ─► AdminUserManagementScreen                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         STACK SCREENS (Modals/Details)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📦 Product Management                                                       │
│  ├── AddProduct ────────► AddProductScreen (modal)                          │
│  ├── EditProduct ───────► EditProductScreen                                 │
│  ├── ProductDetails ────► ProductDetailsScreen                              │
│  └── CategoryManagement ► CategoryManagementScreen                          │
│                                                                              │
│  👤 Admin Settings                                                           │
│  ├── AdminProfile ──────► AdminProfileScreen                                │
│  ├── AdminSettings ─────► AdminSettingsScreen                               │
│  ├── AdminSecurity ─────► AdminSecurityScreen                               │
│  ├── AdminTwoFactor ────► AdminTwoFactorScreen                              │
│  └── AdminUserManagement ► AdminUserManagementScreen                        │
│                                                                              │
│  🚚 Planned Screens (Not Yet Implemented)                                   │
│  ├── OrderDetails ──────► OrderDetailsScreen                                │
│  ├── OrderTracking ─────► OrderTrackingScreen                               │
│  ├── RefundManagement ──► RefundManagementScreen                            │
│  ├── CustomerDetails ───► CustomerDetailsScreen                             │
│  ├── StockAlerts ───────► StockAlertsScreen                                 │
│  └── SupplierManagement ► SupplierManagementScreen                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Customer App Navigation
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CUSTOMER APP NAVIGATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  📱 MainTabNavigator (Bottom Tabs)                                          │
│  ├── 🏠 Home ───────────► HomeScreen                                        │
│  ├── 🛒 Cart ───────────► CartScreen                                        │
│  ├── 📋 Orders ─────────► OrdersScreen                                      │
│  └── 👤 Profile ────────► ProfileScreen                                     │
│                                                                              │
│  📄 Stack Screens                                                            │
│  ├── /checkout ─────────► CheckoutScreen                                    │
│  ├── /order-confirmation ► OrderConfirmationScreen                          │
│  ├── /product/[id] ─────► ProductDetailScreen                               │
│  ├── /category/[id] ────► CategoryProductsScreen                            │
│  ├── /search ───────────► SearchScreen                                      │
│  ├── /notifications ────► NotificationsScreen                               │
│  ├── /favorites ────────► FavoritesScreen                                   │
│  ├── /offers ───────────► OffersScreen                                      │
│  └── /support ──────────► SupportScreen                                     │
│                                                                              │
│  🔐 Auth Navigator                                                           │
│  ├── Login ─────────────► LoginScreen                                       │
│  ├── Register ──────────► RegisterScreen                                    │
│  ├── ForgotPassword ────► ForgotPasswordScreen                              │
│  └── OtpVerification ───► OtpVerificationScreen                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Navigation Type Definitions
```typescript
// Admin Stack Parameter List
export type AdminStackParamList = {
  AdminTabs: undefined;
  
  // Product Management
  AddProduct: undefined;
  EditProduct: {productId: string};
  ProductDetails: {productId: string};
  CategoryManagement: undefined;
  BulkProductUpdate: undefined;
  
  // Order Management
  OrderDetails: {orderId: string};
  OrderTracking: {orderId: string};
  RefundManagement: undefined;
  
  // Customer Management
  CustomerDetails: {customerId: string};
  CustomerCommunication: {customerId: string};
  LoyaltyManagement: undefined;
  
  // Inventory Management
  StockAlerts: undefined;
  SupplierManagement: undefined;
  StockMovement: undefined;
  
  // Settings
  AdminProfile: undefined;
  AdminSettings: undefined;
  AdminSecurity: undefined;
  AdminTwoFactor: undefined;
  AdminUserManagement: undefined;
};

// Admin Tab Parameter List
export type AdminTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Customers: undefined;
  Inventory: undefined;
  AdminUsers: undefined;
};

// Admin Drawer Parameter List
export type AdminDrawerParamList = {
  Main: undefined;
  Profile: undefined;
  Settings: undefined;
  SlotManagement: undefined;
  Reports: undefined;
  Logout: undefined;
};
```

#### Project Folder Structure
```
Daily Fresh Hosur/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── _layout.tsx          # Tab layout configuration
│   │   ├── home.tsx             # Home tab
│   │   ├── cart.tsx             # Cart tab
│   │   ├── orders.tsx           # Orders tab
│   │   └── profile.tsx          # Profile tab
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Entry point
│   ├── checkout.tsx             # Checkout flow
│   ├── order-confirmation.tsx   # Order success
│   ├── admin.tsx                # Admin entry
│   ├── category/[id].tsx        # Category products
│   ├── product/[id].tsx         # Product details
│   └── ...                      # Other screens
│
├── src/
│   ├── navigation/              # Navigation configuration
│   │   ├── AdminNavigator.tsx   # Admin navigation stack
│   │   ├── AuthNavigator.tsx    # Auth flow navigator
│   │   ├── MainTabNavigator.tsx # Customer tabs
│   │   ├── AppNavigator.tsx     # Root navigator
│   │   ├── navigationTypes.ts   # Type definitions
│   │   └── navigationUtils.ts   # Navigation utilities
│   │
│   ├── screens/
│   │   ├── admin/               # Admin screens (21 files)
│   │   │   ├── AdminDashboardScreen.tsx
│   │   │   ├── OrderManagementScreen.tsx
│   │   │   ├── ProductManagementScreen.tsx
│   │   │   ├── CustomerManagementScreen.tsx
│   │   │   ├── InventoryScreen.tsx
│   │   │   ├── SlotManagementScreen.tsx
│   │   │   ├── AnalyticsScreen.tsx
│   │   │   ├── CategoryManagementScreen.tsx
│   │   │   ├── AdminUserManagementScreen.tsx
│   │   │   ├── AdminProfileScreen.tsx
│   │   │   ├── AdminSettingsScreen.tsx
│   │   │   ├── AdminSecurityScreen.tsx
│   │   │   ├── AdminTwoFactorScreen.tsx
│   │   │   └── products/        # Product CRUD screens
│   │   │       ├── AddProductScreen.tsx
│   │   │       ├── EditProductScreen.tsx
│   │   │       └── ProductDetailsScreen.tsx
│   │   │
│   │   ├── auth/                # Authentication screens (12 files)
│   │   ├── cart/                # Cart screens (3 files)
│   │   ├── delivery/            # Delivery screens (3 files)
│   │   ├── home/                # Home screens (4 files)
│   │   ├── orders/              # Order screens (3 files)
│   │   └── reviews/             # Review screens (1 file)
│   │
│   ├── components/              # Reusable components (64 files)
│   ├── hooks/                   # Custom React hooks (19 files)
│   ├── config/                  # Configuration files
│   ├── contexts/                # React contexts
│   └── styles/                  # Shared styles
│
├── lib/                         # Core libraries (101 files)
│   └── supabase/               # Supabase integration
│       ├── client.ts           # Supabase client
│       ├── store/              # Redux store
│       └── services/           # API services
│
├── database/                    # Database schemas & scripts
│   ├── README.md               # Database documentation
│   ├── schemas/                # Organized SQL schemas
│   ├── functions/              # Database functions
│   ├── migrations/             # Version-controlled migrations
│   ├── scripts/                # Admin & utility scripts
│   ├── seeds/                  # Seed data
│   ├── policies/               # RLS policies
│   └── legacy/                 # Original schema files
│
└── agent/                       # Planning & documentation
    ├── PlanUXorder.md          # This file
    ├── app.md                  # App overview
    ├── appdetails.md           # Detailed specifications
    └── fulldetails.md          # Complete documentation
```

---

## 3. Screen-by-Screen UX Requirements

### 3.1 Dashboard Screen

**Purpose:** Quick overview of order metrics and status

**Components:**
- **Header**
  - App logo/title
  - Admin profile icon (top-right)
  - Notification bell icon with badge count
  
- **Statistics Cards** (Horizontal scrollable or grid)
  - Total Orders Today
  - Pending Orders (needs attention - highlight in warning color)
  - Processing Orders
  - Completed Orders Today
  - Cancelled/Refunded Orders
  - **Today's Delivery Slots** (new card)
    - Shows: X orders / Y slots today
    - Tap to view slot breakdown
  - **Urgent Deliveries** (new card - red if any)
    - Orders with delivery slot within 2 hours
    - Tap to filter urgent orders
  
- **Quick Actions**
  - "View All Orders" button
  - "Pending Orders" button (quick access)
  - Filter by date range toggle
  
- **Recent Activity Feed**
  - Last 5-10 recent order updates
  - Shows: Order ID, Customer name, Status change, Timestamp
  - Tap to view order details

**UX Considerations:**
- Use color coding for different order statuses
- Pull-to-refresh functionality
- Real-time updates when new orders arrive (Supabase realtime)
- Loading skeletons for data fetching

---

### 3.2 Orders List Screen

**Purpose:** View and manage all orders with filtering options

**Header:**
- Back button
- "Orders" title
- Search icon
- Filter icon with active filter indicator badge

**Filter Bar:**
- Status chips (horizontally scrollable)
  - All
  - Pending (default highlight)
  - Confirmed
  - Processing
  - Out for Delivery
  - Delivered
  - Cancelled
  - Refunded
- Date filter dropdown (Today, Yesterday, This Week, This Month, Custom Range)
- **Delivery Slot Filter**
  - Today's deliveries
  - Tomorrow's deliveries
  - This week
  - Urgent (within 2 hours)
  - Past due (missed slots)

**Order List Items:**
Each order card displays:
- **Order ID** (#ORD-12345) - Bold, top-left
- **Customer Name** with avatar/icon
- **Order Date & Time** (e.g., "Today, 2:30 PM" or "Oct 25, 10:15 AM")
- **Delivery Slot** - Highlighted with clock icon (e.g., "🕐 Oct 27, 2-4 PM")
- **Status Badge** - Color-coded, prominent
- **Total Amount** - Bold, aligned right
- **Item Count** (e.g., "5 items")
- **Urgent Indicator** - Red badge if delivery slot is approaching (within 2 hours)
- **Quick Action Button** - "Update Status" or status-specific action
- **Chevron right icon** for navigation to details

**Order Card Visual Hierarchy:**
```
┌─────────────────────────────────────────┐
│ #ORD-12345          [Pending Badge]     │
│ 👤 John Doe                     $125.50 │
│ Oct 26, 2:30 PM                5 items  │
│ 🕐 Delivery: Oct 27, 2-4 PM   [URGENT] │
│                    [Update Status] →    │
└─────────────────────────────────────────┘
```

**List Features:**
- Swipe actions (left/right swipe)
  - Swipe right: Quick mark as "Processing"
  - Swipe left: View details / More options
- Pull-to-refresh
- Infinite scroll/pagination
- Empty state with illustration when no orders
- Loading state with skeleton cards

**Color Coding Scheme:**
- Pending: Yellow/Orange (#FFA500)
- Confirmed: Blue (#2196F3)
- Processing: Purple (#9C27B0)
- Out for Delivery: Teal (#00BCD4)
- Delivered: Green (#4CAF50)
- Cancelled: Red (#F44336)
- Refunded: Gray (#757575)

---

### 3.3 Order Details Screen

**Purpose:** View complete order information and manage status

**Header:**
- Back button
- Order ID as title (#ORD-12345)
- Three-dot menu (for additional actions)
  - Print/Export
  - Contact Customer
  - Cancel Order
  - Mark as Fraud (if applicable)

**Content Sections:**

#### A. Status Timeline
Visual timeline showing order progression:
```
○ Pending ───●─── Confirmed ───○─── Processing ───○─── Delivered
     ✓            ✓ Current           Upcoming        Upcoming
```
- Completed steps: Green with checkmark
- Current step: Highlighted/pulsing
- Upcoming steps: Gray/outlined
- Include timestamp for each completed step

#### B. Status Update Section (Prominent)
- Large, colorful status badge showing current status
- **Primary Action Button:** "Update Status" (full-width, prominent)
- When tapped, opens status selection modal

#### C. Customer Information Card
- Customer name with avatar
- Phone number (with tap-to-call icon)
- Email address (with tap-to-email icon)
- Delivery address (with map icon to view location)
- Special instructions (if any) - highlighted in light yellow

#### D. Delivery Slot Information Card (Prominent)
- **Selected Delivery Date & Time Slot** - Large, easy to read
  - Example: "Wednesday, Oct 27, 2025"
  - Time slot: "2:00 PM - 4:00 PM"
- **Visual countdown timer** if delivery is today
  - "Delivers in 3h 25m" with progress bar
- **Urgent indicator** - Red alert badge if within 2 hours
- **Status indicator**
  - "On Time" (green) - order is progressing normally
  - "At Risk" (orange) - order might miss slot
  - "Delayed" (red) - order will miss slot
- **Action Buttons**
  - "Reschedule Delivery" button (opens slot picker)
  - "Notify Customer of Delay" quick action
- **Time slot preference** if customer added notes
  - "Customer prefers: Leave at door"
  - "Customer will be home"

**Delivery Slot Card Visual:**
```
┌──────────────────────────────────────────┐
│ 📅 DELIVERY SLOT                         │
│                                          │
│ Wednesday, October 27, 2025             │
│ ⏰ 2:00 PM - 4:00 PM          [ON TIME] │
│                                          │
│ ⏳ Delivers in 3h 25m                   │
│ ▓▓▓▓▓▓▓▓░░░░░░░░ 60%                    │
│                                          │
│ [Reschedule Slot] [Notify Delay]        │
└──────────────────────────────────────────┘
```

#### E. Order Items Section
List of ordered items:
- Product image thumbnail
- Product name
- Quantity × Unit price
- Subtotal
- Variations/options (size, color, etc.)

**Items Visual:**
```
┌──────────────────────────────────────┐
│ [Image] Product Name                 │
│         Size: L, Color: Blue         │
│         2 × $25.00          $50.00   │
└──────────────────────────────────────┘
```

#### F. Payment Summary Card
- Subtotal
- Tax
- Delivery/Shipping fee
- Discount (if any) - in green
- **Total** (bold, larger font)
- Payment method (Cash/Card/Online)
- Payment status (Paid/Pending/Refunded)

#### G. Order History/Activity Log
Expandable section showing:
- All status changes with timestamp and admin who made the change
- Customer notes/requests
- Admin notes (internal)
- Refund history (if applicable)

**UX Considerations:**
- Sticky "Update Status" button at bottom for easy access
- Confirm dialogs for critical actions (cancel, refund)
- Success animations when status updated
- Error handling with clear messages

---

### 3.4 Update Status Modal

**Purpose:** Change order status efficiently

**Design:**
- Bottom sheet modal (slides up from bottom)
- Semi-transparent backdrop
- Dismissible by tapping outside or close button

**Content:**
- "Update Order Status" title
- Current status indicator
- List of possible next statuses (context-aware)
  - Only show valid next states based on current status
  - Each option as a card with icon and description

**Status Options (Example for Pending Order):**
```
┌─────────────────────────────────────┐
│ ✓ Confirm Order                     │
│   Accept and process this order     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ ✕ Cancel Order                      │
│   Reject and notify customer        │
└─────────────────────────────────────┘
```

**Additional Fields:**
- Optional note/comment field (for status updates)
- Checkbox: "Notify customer via SMS/Email"
- Checkbox: "Send push notification"

**Actions:**
- "Update" button (primary, full-width)
- "Cancel" button (secondary)

**Confirmation:**
- For critical actions (Cancel, Refund), show confirmation dialog
- Success toast/snackbar after update
- Haptic feedback on action

---

### 3.5 Search & Filter Screen

**Purpose:** Find specific orders quickly

**Search Bar:**
- Search by Order ID, Customer name, Phone, Email
- Auto-complete suggestions
- Recent searches

**Advanced Filters:**
- Date range picker (calendar UI)
- Status multi-select
- Payment status filter
- Price range slider
- **Delivery slot filters:**
  - Specific date selection
  - Specific time slot selection
  - Urgent only (within 2 hours)
  - At risk orders (might miss slot)
  - Past due slots
- Sort by:
  - Newest first
  - Oldest first
  - Highest value
  - Lowest value
  - Status priority
  - **Delivery slot time** (earliest first)
  - **Most urgent** (closest to delivery time)

**Applied Filters Display:**
- Chips showing active filters
- Tap X to remove individual filter
- "Clear all" button

**Results:**
- Count of matching orders
- Same order card layout as Orders List
- No results state with suggestions

---

### 3.7 Reschedule Delivery Slot Screen

**Purpose:** Allow admin to change delivery slot when needed

**Design:**
- Full screen or bottom sheet modal
- "Reschedule Delivery" title
- Current slot displayed at top (crossed out or grayed)

**Date Selection:**
- Calendar view (week or month)
- Unavailable dates grayed out
- Highlight available dates
- Show number of available slots per day

**Time Slot Selection:**
- After date selected, show available time slots
- Grid or list layout
- Each slot shows:
  - Time range (e.g., "9:00 AM - 11:00 AM")
  - Capacity indicator (e.g., "3 slots available")
  - Booked/Full indicator if unavailable
- Current slot highlighted differently

**Visual Layout:**
```
┌──────────────────────────────────────┐
│ Current Slot: Oct 27, 2-4 PM  [✕]   │
└──────────────────────────────────────┘

  October 2025
  S  M  T  W  T  F  S
           26 27 28 29 30
        [●] [●] [○] [●] [●]
        3   5   0   4   6  ← slots available

┌──────────────────────────────────────┐
│ 9:00 AM - 11:00 AM     [5 available] │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 11:00 AM - 1:00 PM     [3 available] │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 2:00 PM - 4:00 PM      [FULL]        │
└──────────────────────────────────────┘
```

**Additional Options:**
- Reason for reschedule dropdown
  - Customer requested
  - Inventory delay
  - Delivery capacity
  - Weather/Emergency
  - Other (text field)
- Checkbox: "Notify customer of new slot"
- Text area for message to customer (optional)

**Actions:**
- "Confirm Reschedule" button (primary)
- "Cancel" button

**UX Considerations:**
- Show warning if rescheduling to much later date
- Confirmation dialog: "Customer will be notified of the new delivery slot. Continue?"
- Success message with new slot details
- Update order history with reschedule log

---

### 3.8 Delivery Slot Management Dashboard (Optional Advanced Feature)

**Purpose:** View and manage all delivery slots across orders

**Layout:**
- Tab-based or dropdown date selector
- Selected date at top
- Time slots displayed chronologically

**Time Slot Cards:**
Each slot shows:
- Time range
- Number of orders in this slot
- Capacity indicator (e.g., "8/10 slots used")
- Visual progress bar
- List of order IDs in this slot
- "View Orders" button

**Features:**
- Color coding:
  - Green: Under capacity
  - Yellow: Near capacity (80%+)
  - Red: Full
- Tap slot to see all orders
- Bulk actions for slot orders
- Add/Edit slot capacity

**Example Visual:**
```
┌──────────────────────────────────────┐
│ 🕐 9:00 AM - 11:00 AM                │
│ ▓▓▓▓▓▓▓▓░░ 8/10 orders               │
│                                      │
│ #ORD-123, #ORD-124, #ORD-125...     │
│ [View All Orders in Slot]           │
└──────────────────────────────────────┘
```

---

### 3.9 Notifications Screen

**Purpose:** View system alerts and order updates

**Notification Types:**
- New order placed (requires attention)
- Payment received
- Customer message/inquiry
- Order modification request
- **Delivery slot approaching** (2 hours before)
- **Delivery slot at risk** (order not yet out for delivery)
- **Customer requested reschedule**
- Delivery status updates
- System alerts

**Notification Card:**
- Icon (color-coded by type)
- Title and brief message
- Timestamp
- Order ID (if relevant) - tappable to view order
- Unread indicator (dot or bold text)
- Swipe to delete

**Actions:**
- Mark all as read
- Filter by type
- Clear all

---

## 4. Component Library & UI Elements

### 4.1 Buttons
- **Primary:** Solid background, white text (for main actions)
- **Secondary:** Outlined, transparent background
- **Danger:** Red for destructive actions
- **Sizes:** Small, Medium, Large
- **States:** Default, Pressed, Disabled, Loading

### 4.2 Status Badges
- Rounded rectangle or pill shape
- Bold text, uppercase or capitalize
- Color-coded background with matching text color
- Small size for cards, large for detail view

### 4.3 Cards
- Subtle shadow/elevation
- Rounded corners (8-12px)
- Padding: 16px
- Background: White/light color
- Tappable with press feedback

### 4.4 Input Fields
- Clear labels
- Placeholder text
- Error states with red border and message
- Success states with green check
- Character counter for limited fields

### 4.5 Loading States
- Skeleton screens for lists
- Shimmer effect
- Spinner for button actions
- Progress indicators for multi-step processes

### 4.6 Empty States
- Illustration or icon
- Helpful message
- Suggested action (e.g., "No pending orders - you're all caught up!")

---

## 5. Micro-interactions & Animations

### 5.1 Page Transitions
- Smooth slide/fade transitions between screens
- Native-feeling animations (react-navigation)

### 5.2 Status Update
- Success animation (checkmark, confetti, or pulse)
- Smooth badge color transition
- Timeline progress animation

### 5.3 Pull-to-Refresh
- Standard mobile pull-down gesture
- Loading spinner at top
- Smooth content reload

### 5.4 Swipe Actions
- Reveal action buttons on swipe
- Spring animation when released
- Visual feedback during swipe

### 5.5 Haptic Feedback
- On status update success
- On critical action confirmation
- On swipe action trigger
- **On urgent delivery alert** (stronger vibration)

### 5.6 Delivery Slot Indicators
- **Pulsing animation** for urgent orders (delivery within 2 hours)
- **Countdown timer** with smooth number transitions
- **Progress bar animation** showing time until delivery
- **Color transition** as delivery time approaches:
  - Green → Yellow → Orange → Red
- **Badge bounce** when new urgent order appears

---

## 6. Real-time Features (Supabase Integration)

### 6.1 Live Order Updates
- New orders appear instantly without refresh
- Status changes reflect immediately across all admin devices
- Real-time badge count updates
- **Delivery slot updates** sync across devices
- **Slot capacity updates** when orders are rescheduled
- **Urgent alerts** trigger automatically when delivery time approaches

### 6.2 Push Notifications
- Background notifications for new orders
- In-app toast/banner for updates while app is open
- Sound/vibration alerts (configurable)

### 6.3 Presence Indicators
- Show if another admin is viewing same order (optional)
- Prevent conflicting updates

---

## 7. Accessibility & UX Best Practices

### 7.1 Accessibility
- High contrast mode support
- Font scaling support
- Screen reader compatibility
- Color-blind friendly color schemes (use icons + colors)
- Minimum touch target size: 44x44 pixels

### 7.2 Performance
- Optimize list rendering (FlatList with windowSize)
- Image lazy loading and caching
- Debounce search inputs
- Optimize Supabase queries with indexes

### 7.3 Error Handling
- Network error states with retry option
- Graceful degradation when offline
- Clear error messages (not technical jargon)
- Toast/snackbar for non-critical errors
- Modal dialogs for critical errors

### 7.4 Offline Support
- Cache recent orders for offline viewing
- Queue status updates when offline
- Sync when connection restored
- Clear offline indicator

---

## 8. Status Workflow Logic

### 8.1 Order Status Flow
```
Pending → Confirmed → Processing → Out for Delivery → Delivered
   ↓          ↓            ↓
Cancelled  Cancelled   Cancelled
                ↓
             Refunded
```

### 8.2 Status Permissions & Rules
- Pending → Can be confirmed or cancelled
- Confirmed → Can be moved to processing or cancelled
- Processing → Can be moved to out for delivery or cancelled (with reason)
- Out for Delivery → Can only be marked delivered or cancelled (requires special permission)
- Delivered → Final state, can only be refunded if needed
- Cancelled → Can be refunded if payment was processed
- Refunded → Final state

### 8.3 Automated Status Updates (Optional)
- Auto-confirm orders after X minutes if no action taken
- Auto-notify customer when status changes
- Auto-mark as delivered when GPS confirms delivery (if using delivery tracking)

---

## 9. Data Structure (Supabase Schema Guidance)

> **Note:** See `database/README.md` for complete database documentation

### 9.1 Core Tables
| Table | Description |
|-------|-------------|
| `users` | User profiles extending Supabase auth |
| `orders` | Order records with GST calculations |
| `order_items` | Line items for each order |
| `order_status_history` | Audit trail for order changes |
| `products` | Product catalog with Tamil support |
| `categories` | Hierarchical product categories |
| `delivery_slots` | Available time slots |
| `delivery_slot_instances` | Concrete slot instances |

### 9.4 Real-time Subscriptions
- Subscribe to `orders` table for new orders and status changes
- Subscribe to `delivery_slots` table for capacity updates
- Filter by status for specific views
- **Filter by delivery_date for today's deliveries**
- **Subscribe to orders where delivery_slot_start is within next 2 hours for urgent alerts**
- Use Row Level Security (RLS) for admin-only access

---

## 10. Additional Features (Nice to Have)

### 10.1 Bulk Actions
- Select multiple orders
- Bulk status update
- Bulk export
- **Bulk reschedule** (move multiple orders to new slot)

### 10.2 Delivery Slot Management
- **Slot capacity configuration**
  - Set max orders per time slot
  - Block/unblock specific slots
  - Create custom time slots
- **Automatic slot suggestions**
  - When rescheduling, show best available slots
  - Smart recommendations based on location, order size
- **Slot analytics**
  - Most popular delivery times
  - Slot utilization rate
  - Average orders per slot
- **Delivery route optimization** (advanced)
  - Group orders by area and slot
  - Suggest optimal delivery sequence

### 10.3 Analytics Dashboard
- Order trends graph (daily/weekly/monthly)
- Revenue analytics
- Popular products
- Peak ordering times
- Average fulfillment time
- **Delivery slot analytics:**
  - Slot utilization by day/time
  - Most requested time slots
  - On-time delivery rate
  - Average delivery slot reschedules
  - Slot capacity trends

### 10.4 Customer Communication
- In-app chat/messaging
- Template messages (SMS/Email)
- Order status notification templates

### 10.5 Reports
- Daily sales report
- Order fulfillment report
- **Delivery slot performance report**
- **On-time delivery report**
- Export to CSV/PDF

### 10.6 Settings
- Notification preferences
- Auto-confirm settings
- **Delivery slot settings:**
  - Default slot duration
  - Slot capacity limits
  - Buffer time between slots
  - Advance booking limit
  - Same-day delivery cutoff time
- Display preferences (theme, language)
- Admin account management

---

## 11. User Testing Checklist

Before launch, test:
- [ ] Order list loads quickly with 100+ orders
- [ ] Status updates reflect immediately
- [ ] Real-time notifications work correctly
- [ ] Offline functionality handles gracefully
- [ ] Search and filters return accurate results
- [ ] All critical actions have confirmations
- [ ] Error states display helpful messages
- [ ] UI is responsive on different screen sizes
- [ ] Color-blind users can distinguish statuses
- [ ] App performs well on low-end devices
- [ ] Supabase RLS policies prevent unauthorized access
- [ ] **Delivery slot countdown timer is accurate**
- [ ] **Urgent alerts trigger at correct time (2 hours before)**
- [ ] **Slot capacity updates correctly when orders rescheduled**
- [ ] **Reschedule functionality prevents double-booking**
- [ ] **Delivery slot filters work accurately**
- [ ] **Customer notifications sent when slot changed**
- [ ] **Past due slots are clearly identified**

---

## 12. Technical Implementation Notes

> **Reference:** See existing code in `src/navigation/AdminNavigator.tsx` and `src/screens/admin/`

### 12.1 Navigation Libraries
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/drawer": "^6.x"
}
```

### 12.2 Supabase Setup
> **Reference:** See `lib/supabase/client.ts` for configuration

### 12.3 Performance Optimization
- Use FlatList for long lists with `getItemLayout`
- Implement pagination (20-50 orders per page)
- Cache images with react-native-fast-image
- Debounce search with 300ms delay
- Memoize expensive computations with useMemo

---

## 13. Mobile-Specific Considerations

### 13.1 iOS
- Use native iOS design patterns where appropriate
- Handle safe area insets (notch, home indicator)
- Support dark mode
- Haptic feedback with iOS haptics API

### 13.2 Android
- Material Design components
- Hardware back button handling
- Support for various screen sizes and densities
- Notification channels for different alert types

### 13.3 Cross-Platform
- Test on both platforms regularly
- Platform-specific code when necessary
- Consistent UX across platforms where possible

### 13.4 Web
- Expo web support with `npx expo start --web`
- Responsive layout for desktop browsers
- Web-compatible components in `src/components/ui/WebCompatibleComponents`

---

## 14. Security Considerations

- Implement secure admin authentication (Supabase Auth)
- Use RLS policies to restrict data access
- Validate all inputs on client and server
- Encrypt sensitive data in transit (HTTPS)
- Log all critical actions (status changes, cancellations)
- Implement session timeout
- Two-factor authentication for admin accounts (optional but recommended)

---

## 15. Database Schema Reference

> **Full documentation:** See `database/README.md`

### Key Tables for Order Management:

```sql
-- Orders table with GST compliance
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  delivery_slot_instance_id UUID REFERENCES delivery_slot_instances(id),
  subtotal DECIMAL(10,2) NOT NULL,
  cgst_amount DECIMAL(10,2) DEFAULT 0,  -- 9%
  sgst_amount DECIMAL(10,2) DEFAULT 0,  -- 9%
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order status history for audit trail
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  status order_status NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery slot system
CREATE TABLE delivery_slot_instances (
  id UUID PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL,
- Use Row Level Security (RLS) for admin-only access

---

## 10. Additional Features (Nice to Have)

### 10.1 Bulk Actions
- Select multiple orders
- Bulk status update
- Bulk export
- **Bulk reschedule** (move multiple orders to new slot)

### 10.2 Delivery Slot Management
- **Slot capacity configuration**
  - Set max orders per time slot
  - Block/unblock specific slots
  - Create custom time slots
- **Automatic slot suggestions**
  - When rescheduling, show best available slots
  - Smart recommendations based on location, order size
- **Slot analytics**
  - Most popular delivery times
  - Slot utilization rate
  - Average orders per slot
- **Delivery route optimization** (advanced)
  - Group orders by area and slot
  - Suggest optimal delivery sequence

### 10.3 Analytics Dashboard
- Order trends graph (daily/weekly/monthly)
- Revenue analytics
- Popular products
- Peak ordering times
- Average fulfillment time
- **Delivery slot analytics:**
  - Slot utilization by day/time
  - Most requested time slots
  - On-time delivery rate
  - Average delivery slot reschedules
  - Slot capacity trends

### 10.4 Customer Communication
- In-app chat/messaging
- Template messages (SMS/Email)
- Order status notification templates

### 10.5 Reports
- Daily sales report
- Order fulfillment report
- **Delivery slot performance report**
- **On-time delivery report**
- Export to CSV/PDF

### 10.6 Settings
- Notification preferences
- Auto-confirm settings
- **Delivery slot settings:**
  - Default slot duration
  - Slot capacity limits
  - Buffer time between slots
  - Advance booking limit
  - Same-day delivery cutoff time
- Display preferences (theme, language)
- Admin account management

---

## 11. User Testing Checklist

Before launch, test:
- [ ] Order list loads quickly with 100+ orders
- [ ] Status updates reflect immediately
- [ ] Real-time notifications work correctly
- [ ] Offline functionality handles gracefully
- [ ] Search and filters return accurate results
- [ ] All critical actions have confirmations
- [ ] Error states display helpful messages
- [ ] UI is responsive on different screen sizes
- [ ] Color-blind users can distinguish statuses
- [ ] App performs well on low-end devices
- [ ] Supabase RLS policies prevent unauthorized access
- [ ] **Delivery slot countdown timer is accurate**
- [ ] **Urgent alerts trigger at correct time (2 hours before)**
- [ ] **Slot capacity updates correctly when orders rescheduled**
- [ ] **Reschedule functionality prevents double-booking**
- [ ] **Delivery slot filters work accurately**
- [ ] **Customer notifications sent when slot changed**
- [ ] **Past due slots are clearly identified**

---

## 12. Technical Implementation Notes

> **Reference:** See existing code in `src/navigation/AdminNavigator.tsx` and `src/screens/admin/`

### 12.1 Navigation Libraries
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/drawer": "^6.x"
}
```

### 12.2 Supabase Setup
> **Reference:** See `lib/supabase/client.ts` for configuration

### 12.3 Performance Optimization
- Use FlatList for long lists with `getItemLayout`
- Implement pagination (20-50 orders per page)
- Cache images with react-native-fast-image
- Debounce search with 300ms delay
- Memoize expensive computations with useMemo

---

## 13. Mobile-Specific Considerations

### 13.1 iOS
- Use native iOS design patterns where appropriate
- Handle safe area insets (notch, home indicator)
- Support dark mode
- Haptic feedback with iOS haptics API

### 13.2 Android
- Material Design components
- Hardware back button handling
- Support for various screen sizes and densities
- Notification channels for different alert types

### 13.3 Cross-Platform
- Test on both platforms regularly
- Platform-specific code when necessary
- Consistent UX across platforms where possible

### 13.4 Web
- Expo web support with `npx expo start --web`
- Responsive layout for desktop browsers
- Web-compatible components in `src/components/ui/WebCompatibleComponents`

---

## 14. Security Considerations

- Implement secure admin authentication (Supabase Auth)
- Use RLS policies to restrict data access
- Validate all inputs on client and server
- Encrypt sensitive data in transit (HTTPS)
- Log all critical actions (status changes, cancellations)
- Implement session timeout
- Two-factor authentication for admin accounts (optional but recommended)

---

## 15. Database Schema Reference

> **Full documentation:** See `database/README.md`

### Key Tables for Order Management:

```sql
-- Orders table with GST compliance
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  delivery_slot_instance_id UUID REFERENCES delivery_slot_instances(id),
  subtotal DECIMAL(10,2) NOT NULL,
  cgst_amount DECIMAL(10,2) DEFAULT 0,  -- 9%
  sgst_amount DECIMAL(10,2) DEFAULT 0,  -- 9%
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order status history for audit trail
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  status order_status NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery slot system
CREATE TABLE delivery_slot_instances (
  id UUID PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL,
  booked_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available'
);
```

---

## 16. Implementation Status

### 16.1 Completed Components & Screens

#### Order Management Service (`lib/supabase/services/orderManagement.ts`)
**Status: ✅ Implemented**

A comprehensive Supabase service centralizing all order-related operations:

- **Types Defined:**
  - `Order`, `OrderItem`, `OrderAddress`, `OrderStatus`, `PaymentStatus`
  - `OrderWithDetails` (includes items, customer, delivery slot, status history)
  - `OrderStatusHistory`, `CreateOrderInput`, `OrderFilters`

- **Customer Operations:**
  - `getCustomerOrders(userId, filters)` - Fetch user-specific orders with filtering
  - `getOrderDetails(orderId, userId?)` - Retrieve single order details with ownership validation
  - `createOrder(input)` - Create order with GST calculation, order number generation
  - `cancelOrder(orderId, userId, reason)` - Customer cancellation with status validation

- **Admin Operations:**
  - `getAdminOrders(filters)` - Fetch all orders with extensive filtering
  - `updateOrderStatus(orderId, newStatus, adminUserId, notes?)` - Status update with transition validation
  - `getOrderStatistics(period)` - Aggregated order metrics (today, week, month)
  - `getUrgentOrders()` - Orders with delivery slots within 2 hours
  - `updatePaymentStatus(orderId, paymentStatus, paymentId?)` - Payment status updates
  - `processRefund(orderId, refundAmount, adminUserId)` - Refund processing

- **Real-time:**
  - `subscribeToOrders(callback, filters?)` - Real-time order updates using Supabase

#### OrderStatusTimeline Component (`src/components/orders/OrderStatusTimeline.tsx`)
**Status: ✅ Implemented**

A reusable visual component for order status progression:

- Displays status steps: `pending` → `confirmed` → `preparing` → `out_for_delivery` → `delivered`
- Supports both `horizontal` and `vertical` layouts
- Shows `completed`, `current`, and `upcoming` status states
- Integrates with `statusHistory` for timestamps
- Special UI for `cancelled` and `refunded` terminal states
- Exports `getStatusInfo()` helper for consistent status labels, colors, and icons

#### UpdateStatusModal Component (`src/components/orders/UpdateStatusModal.tsx`)
**Status: ✅ Implemented**

Bottom sheet modal for admin status updates:

- Displays current order status
- Shows valid next status options based on current status
- Supports optional notes for status updates
- Toggles for customer notification (SMS/Email) and push notifications
- Confirmation dialog for critical actions (cancel, refund)
- Loading states and error handling

#### AdminOrderDetailsScreen (`src/screens/admin/AdminOrderDetailsScreen.tsx`)
**Status: ✅ Implemented**

Comprehensive admin order management screen:

- **Status Card:** Current status badge, timeline, update button
- **Delivery Slot Card:** Date/time, countdown timer, urgent indicators
- **Customer Info:** Name, phone, email, delivery address with tap-to-action
- **Order Items:** Product list with images, quantities, prices
- **Payment Summary:** Subtotal, GST breakdown, delivery, discounts, total
- **Order History:** Status change audit trail
- **Quick Actions:** Print invoice, call customer, get directions
- Integrates with UpdateStatusModal for status changes

#### CustomerOrderDetailsScreen (`src/screens/orders/CustomerOrderDetailsScreen.tsx`)
**Status: ✅ Implemented**

Enhanced customer order details screen:

- **Status Hero:** Large status icon, order number, date
- **Delivery Card:** Date, time slot, address preview
- **Order Timeline:** Vertical progress with timestamps
- **Order Items:** Product images, names, quantities, totals
- **Bill Details:** Itemized breakdown with GST
- **Delivery Address:** Full address with landmarks and instructions
- **Action Buttons:** Cancel order, reorder, contact support
- **Cancellation Info:** Reason and refund status for cancelled orders

### 16.2 Navigation Updates
## 12. Technical Implementation Notes

> **Reference:** See existing code in `src/navigation/AdminNavigator.tsx` and `src/screens/admin/`

### 12.1 Navigation Libraries
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/native-stack": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "@react-navigation/drawer": "^6.x"
}
```

### 12.2 Supabase Setup
> **Reference:** See `lib/supabase/client.ts` for configuration

### 12.3 Performance Optimization
- Use FlatList for long lists with `getItemLayout`
- Implement pagination (20-50 orders per page)
- Cache images with react-native-fast-image
- Debounce search with 300ms delay
- Memoize expensive computations with useMemo

---

## 13. Mobile-Specific Considerations

### 13.1 iOS
- Use native iOS design patterns where appropriate
- Handle safe area insets (notch, home indicator)
- Support dark mode
- Haptic feedback with iOS haptics API

### 13.2 Android
- Material Design components
- Hardware back button handling
- Support for various screen sizes and densities
- Notification channels for different alert types

### 13.3 Cross-Platform
- Test on both platforms regularly
- Platform-specific code when necessary
- Consistent UX across platforms where possible

### 13.4 Web
- Expo web support with `npx expo start --web`
- Responsive layout for desktop browsers
- Web-compatible components in `src/components/ui/WebCompatibleComponents`

---

## 14. Security Considerations

- Implement secure admin authentication (Supabase Auth)
- Use RLS policies to restrict data access
- Validate all inputs on client and server
- Encrypt sensitive data in transit (HTTPS)
- Log all critical actions (status changes, cancellations)
- Implement session timeout
- Two-factor authentication for admin accounts (optional but recommended)

---

## 15. Database Schema Reference

> **Full documentation:** See `database/README.md`

### Key Tables for Order Management:

```sql
-- Orders table with GST compliance
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  delivery_slot_instance_id UUID REFERENCES delivery_slot_instances(id),
  subtotal DECIMAL(10,2) NOT NULL,
  cgst_amount DECIMAL(10,2) DEFAULT 0,  -- 9%
  sgst_amount DECIMAL(10,2) DEFAULT 0,  -- 9%
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order status history for audit trail
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  status order_status NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Delivery slot system
CREATE TABLE delivery_slot_instances (
  id UUID PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_ts TIMESTAMP NOT NULL,
  end_ts TIMESTAMP NOT NULL,
  capacity INTEGER NOT NULL,
  booked_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available'
);
```

---

## 16. Implementation Status

### 16.1 Completed Components & Screens

#### Order Management Service (`lib/supabase/services/orderManagement.ts`)
**Status: ✅ Implemented**

A comprehensive Supabase service centralizing all order-related operations:

- **Types Defined:**
  - `Order`, `OrderItem`, `OrderAddress`, `OrderStatus`, `PaymentStatus`
  - `OrderWithDetails` (includes items, customer, delivery slot, status history)
  - `OrderStatusHistory`, `CreateOrderInput`, `OrderFilters`

- **Customer Operations:**
  - `getCustomerOrders(userId, filters)` - Fetch user-specific orders with filtering
  - `getOrderDetails(orderId, userId?)` - Retrieve single order details with ownership validation
  - `createOrder(input)` - Create order with GST calculation, order number generation
  - `cancelOrder(orderId, userId, reason)` - Customer cancellation with status validation

- **Admin Operations:**
  - `getAdminOrders(filters)` - Fetch all orders with extensive filtering
  - `updateOrderStatus(orderId, newStatus, adminUserId, notes?)` - Status update with transition validation
  - `getOrderStatistics(period)` - Aggregated order metrics (today, week, month)
  - `getUrgentOrders()` - Orders with delivery slots within 2 hours
  - `updatePaymentStatus(orderId, paymentStatus, paymentId?)` - Payment status updates
  - `processRefund(orderId, refundAmount, adminUserId)` - Refund processing

- **Real-time:**
  - `subscribeToOrders(callback, filters?)` - Real-time order updates using Supabase

#### OrderStatusTimeline Component (`src/components/orders/OrderStatusTimeline.tsx`)
**Status: ✅ Implemented**

A reusable visual component for order status progression:

- Displays status steps: `pending` → `confirmed` → `preparing` → `out_for_delivery` → `delivered`
- Supports both `horizontal` and `vertical` layouts
- Shows `completed`, `current`, and `upcoming` status states
- Integrates with `statusHistory` for timestamps
- Special UI for `cancelled` and `refunded` terminal states
- Exports `getStatusInfo()` helper for consistent status labels, colors, and icons

#### UpdateStatusModal Component (`src/components/orders/UpdateStatusModal.tsx`)
**Status: ✅ Implemented**

Bottom sheet modal for admin status updates:

- Displays current order status
- Shows valid next status options based on current status
- Supports optional notes for status updates
- Toggles for customer notification (SMS/Email) and push notifications
- Confirmation dialog for critical actions (cancel, refund)
- Loading states and error handling

#### OrderManagementScreen (`src/screens/admin/OrderManagementScreen.tsx`)
**Status: ✅ Implemented**

Admin order list screen:

- **Order Fetching:** Fetches all orders using `orderManagementService.getAdminOrders`
- **Filtering:** Filter by status (tabs) and search by order number/customer name
- **UI:** Uses `WebCompatibleComponents` for consistent look
- **Navigation:** Navigates to `AdminOrderDetailsScreen` on order tap
- **Real-time:** Auto-refreshes on focus and supports pull-to-refresh

#### AdminOrderDetailsScreen (`src/screens/admin/AdminOrderDetailsScreen.tsx`)
**Status: ✅ Implemented**

Comprehensive admin order management screen:

- **Status Card:** Current status badge, timeline, update button
- **Delivery Slot Card:** Date/time, countdown timer, urgent indicators
- **Customer Info:** Name, phone, email, delivery address with tap-to-action
- **Order Items:** Product list with images, quantities, prices
- **Payment Summary:** Subtotal, GST breakdown, delivery, discounts, total
- **Order History:** Status change audit trail
- **Quick Actions:** Print invoice, call customer, get directions
- Integrates with UpdateStatusModal for status changes

#### CustomerOrderDetailsScreen (`src/screens/orders/CustomerOrderDetailsScreen.tsx`)
**Status: ✅ Implemented**

Enhanced customer order details screen:

- **Status Hero:** Large status icon, order number, date
- **Delivery Card:** Date, time slot, address preview
- **Order Timeline:** Vertical progress with timestamps
- **Order Items:** Product images, names, quantities, totals
- **Bill Details:** Itemized breakdown with GST
- **Delivery Address:** Full address with landmarks and instructions
- **Action Buttons:** Cancel order, reorder, contact support
- **Cancellation Info:** Reason and refund status for cancelled orders

### 16.2 Navigation Updates

- Added `AdminOrderDetailsScreen` to `AdminNavigator.tsx`
- Route: `OrderDetails` with `{ orderId: string }` params
- Components index file created at `src/components/orders/index.ts`

### 16.3 Pending Implementation

| Feature | Status | Priority |
|---------|--------|----------|
| OrderTrackingScreen (Customer) | ✅ Implemented | High |
| Live Order Tracking (GPS) | 🚧 Planned | Medium |
| RefundManagementScreen | 🚧 Planned | Medium |
| Invoice PDF Generation | 🚧 Planned | Medium |
| Push Notifications | 🚧 Planned | High |
| Bulk Status Updates | 🚧 Planned | Low |
| Reschedule Delivery Modal | 🚧 Planned | Medium |
| Order Statistics Dashboard | 🚧 Partial | Medium |

### 16.4 Status Transition Rules

Implemented in `orderManagement.ts`:

```
pending → confirmed, cancelled
confirmed → preparing, cancelled
preparing → out_for_delivery, cancelled
out_for_delivery → delivered, cancelled
delivered → refunded
cancelled → refunded
refunded → (terminal state)
```

### 16.5 Recent Updates (Customer Order Management)
**Status: ✅ Completed**

- **Web Compatibility:** Resolved React Native component import errors by utilizing `WebCompatibleComponents`.
- **Order History:** Developed `OrderHistoryScreen.tsx` with real data fetching from `orderManagementService`.
- **Order Tracking:** Developed `OrderTrackingScreen.tsx` with real data fetching and integrated into `MainTabNavigator`.
- **Order Details:** Enhanced `OrderDetailsScreen.tsx` with real data, reorder functionality (integrated with Cart), and cancellation logic.
- **Authentication:** Replaced mock `useAuth` hook with actual Redux-based authentication context.
- **Data Consistency:** Aligned frontend types with Supabase backend (snake_case properties).

---

*Last Updated: December 4, 2024*
*Version: 2.2 - Updated with customer order management implementation*