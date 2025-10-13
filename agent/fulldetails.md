Organic Produce Delivery App - AI Agent Context
System Overview
You are an AI assistant helping to build a mobile e-commerce application for ordering fresh vegetables, fruits, organic produce, and rice with scheduled delivery slots.
Tech Stack

Frontend: React Native (iOS & Android)
Backend: Node.js with Express.js
Database: MongoDB
Authentication: JWT-based
Payment: Stripe/Razorpay/PayPal

Core Features
1. User Management

Registration with email/phone verification
JWT-based authentication
Profile management (addresses, preferences, payment methods)
Guest checkout option

2. Product Catalog
Categories: Fresh Vegetables, Fresh Fruits, Organic Vegetables, Organic Fruits, Rice & Grains
Features:

Search and filtering
Product details with images, nutritional info
Price display with units (kg/piece/bundle)
Stock availability
Seasonal recommendations

3. Delivery Slot System (Critical Feature)
Slot Types:

Morning: 6 AM - 12 PM
Evening: 2 PM - 8 PM
Express: Same day (premium)
Scheduled: Up to 7 days advance

Management:

Calendar view for selection
Real-time availability tracking
Capacity management
Slot pricing (free/premium)
Area coverage restrictions
Weather-based suspension
Holiday scheduling

4. Shopping & Orders

Cart with persistence
Tax and discount calculation
Multiple payment methods
Order tracking with status updates
Order history and reordering
Modification/cancellation with refunds

5. Notifications
Push notifications for: order confirmations, delivery updates, promotional offers, slot availability, payment confirmations
API Endpoints
Authentication

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/forgot-password
POST /api/auth/reset-password

Products

GET /api/products
GET /api/products/:id
GET /api/products/category/:category
GET /api/products/search?q=query
POST /api/admin/products (Admin)
PUT /api/admin/products/:id (Admin)
DELETE /api/admin/products/:id (Admin)

Delivery Slots

GET /api/delivery-slots/available
GET /api/delivery-slots/date/:date
POST /api/delivery-slots/book
PUT /api/delivery-slots/:id/modify
DELETE /api/delivery-slots/:id/cancel
GET /api/admin/delivery-slots (Admin)
POST /api/admin/delivery-slots (Admin)

Orders

POST /api/orders
GET /api/orders/user/:userId
GET /api/orders/:orderId
PUT /api/orders/:orderId/status
GET /api/admin/orders (Admin)
PUT /api/admin/orders/:orderId (Admin)

Database Schema (MongoDB)
Users
javascript{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  password: String, // hashed with bcrypt
  role: String, // 'customer' or 'admin'
  addresses: [{
    type: String, // 'home' or 'work'
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: { lat: Number, lng: Number }
  }],
  preferences: {
    organic_only: Boolean,
    dietary_restrictions: [String]
  },
  created_at: Date,
  updated_at: Date
}
Products
javascript{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  subcategory: String,
  images: [String],
  price: Number,
  unit: String, // 'kg', 'piece', 'bundle'
  stock_quantity: Number,
  organic: Boolean,
  nutritional_info: {
    calories: Number,
    vitamins: [String]
  },
  seasonal: Boolean,
  available: Boolean,
  created_at: Date,
  updated_at: Date
}
Delivery Slots
javascript{
  _id: ObjectId,
  date: Date,
  time_start: String, // "09:00"
  time_end: String, // "12:00"
  capacity: Number,
  booked: Number,
  price: Number, // delivery charge
  type: String, // 'standard' or 'express'
  areas: [String], // serviceable areas
  active: Boolean,
  created_at: Date
}
Orders
javascript{
  _id: ObjectId,
  user_id: ObjectId,
  order_number: String,
  items: [{
    product_id: ObjectId,
    quantity: Number,
    price: Number,
    unit: String
  }],
  delivery_slot_id: ObjectId,
  delivery_address: Object,
  subtotal: Number,
  delivery_charge: Number,
  tax: Number,
  discount: Number,
  total: Number,
  payment_method: String,
  payment_status: String,
  order_status: String, // 'pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'
  notes: String,
  created_at: Date,
  updated_at: Date
}
Admin Panel Features

Sales analytics and reports
Product management (CRUD, bulk upload via CSV)
Inventory tracking with low stock alerts
Order management and status updates
Delivery slot configuration and utilization reports
Customer management and support tickets
Content management (banners, FAQs, policies)

Performance Requirements

App load time: < 3 seconds
API response time: < 500ms
Support 1000+ concurrent users
99.9% uptime
Offline browsing capability (cached data)

Security Requirements

JWT token authentication
bcrypt password encryption
HTTPS for all communications
Input validation and sanitization
API rate limiting
PCI DSS compliance for payments

Integration Requirements

Payment: Credit/Debit cards, Digital wallets (Google Pay, Apple Pay), UPI, Cash on Delivery
Third-party: SMS gateway (OTP), Email service, Maps API, Firebase/Google Analytics, Cloud storage (AWS S3/Cloudinary)

Key Success Metrics

Customer acquisition and retention rates
Order completion rate
Average order value
Delivery slot utilization
App crash rate < 1%
API uptime > 99.9%
Successful payment rate > 98%

Future Enhancements

Subscription-based recurring orders
AI-powered recommendations
AR product preview
Community features (reviews, recipes)
GPS delivery tracking
Multi-vendor marketplace
Predictive inventory management
Dynamic pricing


When assisting with this project: Prioritize security, scalability, and user experience. The delivery slot management system is a core differentiator. Always consider mobile-first design patterns and ensure code follows React Native and Node.js best practices.Retrygrocery-delivery-app/
├── app/                     # Main application directory (changed from src)
│   ├── components/          # React components (.tsx)
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Loader.tsx
│   │   │  pastedI'll provide you with comprehensive TypeScript code for all the missing product components. These are production-ready components designed specifically for your grocery delivery app.
Product Components - TypeScript Code
Code 
// ====================================================================pastedPerfect! I've provided you with comprehensive TypeScript code for all the missing delivery and payment components. Here's what each component offers:
🗺️ Delivery Components
1. DeliveryMap.tsx
•	Features: Real-time tracking, route display, multiple markers
•	Integration: Google Maps, GeolocationpastedI'll provide you with comprehensive TypeScript custom hooks for your grocery delivery app. These hooks will handle location services, payments, delivery slots, notifications, and admin functionality.Perfect! I've provided you with comprehensive TypeScript custom hooks for your grocery delivery app. pastedPerfect! I've provided you with comprehensive TypeScript configuration files for your grocery delivery app. Here's what each configuration file offers:
📁 Configuration Files Overview
1. environment.ts
•	Multi-environment support (development, staging, production)
•	Firebase configuration for pupastedI'll provide you with comprehensive TypeScript code for all the missing cart components. These are production-ready components designed specifically for your grocery delivery app.Perfect! I've provided you with comprehensive TypeScript code for all the missing cart components. Here's what each compopastedDcreate full details context // Card usage in ProductCard component
<Card
  variant="elevated"
  onPress={() => navigateToProduct(product.id)}
  testID="product-card"
> 
  <ProductDetails product={product} />
</Card>
 
// Header usage in screens
<Header
  title="Fresh Vegetables"
  showBack={true}
  onBack={() => navigation.goBack()}
  rightActions={[
    {icon: 'search', onPress: () => setShowSearch(true)},
    {icon: 'shopping-cart', onPress: () => navigation.navigate('Cart')}
  ]}
/>
 
// Input usage in forms
<Input
  label="Email Address"
  placeholder="Enter your email"
  leftIcon="email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  required={true}
  keyboardType="email-address"
/>
 
// Loader usage
<OverlayLoader
  visible={isLoading}
  text="Loading products..."
/>
 
// Modal usage
<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Order"
  actions={[
    {text: 'Cancel', onPress: () => setShowModal(false), variant: 'secondary'},
    {text: 'Confirm', onPress: handleConfirmOrder, variant: 'primary'}
  ]}
> 
  <OrderSummary order={currentOrder} />
</Modal>EditGrocery Delivery App - Complete AI Agent Context
Project Overview
A full-stack mobile e-commerce application for ordering fresh vegetables, fruits, organic produce, and rice with scheduled delivery slots, built for the UAE market (specifically Abu Dhabi).

Technology Stack
Frontend

Framework: React Native (iOS & Android)
Language: TypeScript
State Management: Redux Toolkit
Navigation: React Navigation
UI Libraries: Custom components with React Native core

Backend

Runtime: Node.js with Express.js
Database: MongoDB
Authentication: JWT-based
Payment: Stripe, Razorpay, PayPal

Third-Party Integrations

Maps: Google Maps API
Notifications: Firebase Cloud Messaging
Storage: AWS S3/Cloudinary
Analytics: Firebase/Google Analytics


Architecture & File Structure
grocery-delivery-app/
├── app/                          # Main application directory
│   ├── components/               # Reusable React components
│   │   ├── common/              # Shared UI components
│   │   │   ├── Button.tsx       # Customizable button component
│   │   │   ├── Input.tsx        # Form input with validation
│   │   │   ├── Header.tsx       # Navigation header
│   │   │   ├── Loader.tsx       # Loading indicators
│   │   │   ├── Modal.tsx        # Modal dialogs
│   │   │   └── Card.tsx         # Card container component
│   │   │
│   │   ├── product/             # Product-related components
│   │   │   ├── ProductCard.tsx      # Grid/list product display
│   │   │   ├── ProductList.tsx      # Product listing with pagination
│   │   │   ├── ProductFilter.tsx    # Advanced filtering modal
│   │   │   └── ProductSearch.tsx    # Search with suggestions
│   │   │
│   │   ├── cart/                # Shopping cart components
│   │   │   ├── CartItem.tsx         # Individual cart item
│   │   │   ├── CartSummary.tsx      # Order total breakdown
│   │   │   └── CouponInput.tsx      # Discount code application
│   │   │
│   │   ├── delivery/            # Delivery management components
│   │   │   ├── SlotPicker.tsx       # Delivery slot selector
│   │   │   ├── SlotCalendar.tsx     # Date selection calendar
│   │   │   ├── TimeSlotGrid.tsx     # Time slot display
│   │   │   └── DeliveryMap.tsx      # Map with tracking
│   │   │
│   │   └── payment/             # Payment components
│   │       ├── PaymentMethods.tsx   # Payment method selector
│   │       ├── PaymentForm.tsx      # Payment details form
│   │       └── PaymentStatus.tsx    # Transaction status display
│   │
│   ├── screens/                 # Application screens
│   │   ├── auth/                # Authentication screens
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   ├── OTPVerificationScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   ├── home/                # Home & browse screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CategoryScreen.tsx
│   │   │   ├── ProductDetailsScreen.tsx
│   │   │   └── SearchScreen.tsx
│   │   │
│   │   ├── cart/                # Cart & checkout screens
│   │   │   ├── CartScreen.tsx
│   │   │   ├── CheckoutScreen.tsx
│   │   │   └── OrderConfirmationScreen.tsx
│   │   │
│   │   ├── orders/              # Order management screens
│   │   │   ├── OrderHistoryScreen.tsx
│   │   │   ├── OrderDetailsScreen.tsx
│   │   │   └── OrderTrackingScreen.tsx
│   │   │
│   │   ├── delivery/            # Delivery screens
│   │   │   ├── DeliverySlotScreen.tsx
│   │   │   ├── AddressScreen.tsx
│   │   │   └── DeliveryInstructionsScreen.tsx
│   │   │
│   │   └── admin/               # Admin dashboard screens
│   │       ├── Dashboard (Tab)
│   │       ├── Products (Tab)
│   │       │   ├── Add Product (Modal)
│   │       │   ├── Edit Product
│   │       │   ├── Product Details
│   │       │   ├── Category Management
│   │       │   └── Bulk Update (Modal)
│   │       ├── Orders (Tab)
│   │       │   ├── Order Details
│   │       │   ├── Order Tracking
│   │       │   └── Refund Management
│   │       ├── Customers (Tab)
│   │       │   ├── Customer Details
│   │       │   ├── Communication
│   │       │   └── Loyalty Management
│   │       ├── Inventory (Tab)
│   │       │   ├── Stock Alerts
│   │       │   ├── Supplier Management
│   │       │   └── Stock Movement
│   │       └── Analytics (Tab)
│   │           ├── Sales Reports
│   │           ├── Customer Reports
│   │           ├── Product Reports
│   │           └── Delivery Reports
│   │
│   ├── navigation/              # Navigation configuration
│   │   ├── AppNavigator.tsx         # Root navigator
│   │   ├── AuthNavigator.tsx        # Auth flow navigation
│   │   ├── MainTabNavigator.tsx     # Main app tabs
│   │   └── AdminNavigator.tsx       # Admin panel navigation
│   │
│   ├── services/                # API & service layer
│   │   ├── api/                 # API services
│   │   │   ├── authService.ts       # Authentication APIs
│   │   │   ├── productService.ts    # Product CRUD
│   │   │   ├── cartService.ts       # Cart management
│   │   │   ├── orderService.ts      # Order processing
│   │   │   ├── deliveryService.ts   # Delivery slot APIs
│   │   │   ├── paymentService.ts    # Payment processing
│   │   │   ├── adminService.ts      # Admin operations
│   │   │   ├── notificationService.ts # Push notifications
│   │   │   └── apiClient.ts         # HTTP client configuration
│   │   │
│   │   ├── payment/             # Payment gateway integrations
│   │   │   ├── stripeService.ts
│   │   │   ├── razorpayService.ts
│   │   │   ├── paypalService.ts
│   │   │   └── paymentGateway.ts    # Unified payment interface
│   │   │
│   │   ├── storage/             # Local storage services
│   │   │   ├── asyncStorage.ts      # Async storage wrapper
│   │   │   ├── secureStorage.ts     # Secure credential storage
│   │   │   └── cacheService.ts      # Data caching
│   │   │
│   │   ├── location/            # Location services
│   │   │   ├── locationService.ts   # GPS & geolocation
│   │   │   └── geocoding.ts         # Address geocoding
│   │   │
│   │   └── push/                # Push notification services
│   │       ├── pushNotificationService.ts
│   │       └── deepLinking.ts       # Deep link handling
│   │
│   ├── store/                   # Redux state management
│   │   ├── index.ts                 # Store exports
│   │   ├── store.ts                 # Store configuration
│   │   ├── slices/              # Redux slices
│   │   │   ├── authSlice.ts         # Authentication state
│   │   │   ├── productSlice.ts      # Product catalog state
│   │   │   ├── cartSlice.ts         # Shopping cart state
│   │   │   ├── orderSlice.ts        # Order management state
│   │   │   ├── deliverySlice.ts     # Delivery slot state
│   │   │   ├── userSlice.ts         # User profile state
│   │   │   └── adminSlice.ts        # Admin dashboard state
│   │   │
│   │   └── middleware/          # Redux middleware
│   │       ├── authMiddleware.ts    # Auth token handling
│   │       └── apiMiddleware.ts     # API call middleware
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useCart.ts               # Cart management hook
│   │   ├── useLocation.ts           # Location services hook
│   │   ├── usePayment.ts            # Payment processing hook
│   │   ├── useDeliverySlots.ts      # Delivery slot management
│   │   ├── useNotifications.ts      # Push notification hook
│   │   └── useAdmin.ts              # Admin operations hook
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.ts                  # Auth-related types
│   │   ├── product.ts               # Product types
│   │   ├── cart.ts                  # Cart types
│   │   ├── order.ts                 # Order types
│   │   ├── delivery.ts              # Delivery types
│   │   ├── payment.ts               # Payment types
│   │   ├── admin.ts                 # Admin types
│   │   ├── navigation.ts            # Navigation types
│   │   └── api.ts                   # API response types
│   │
│   ├── utils/                   # Utility functions
│   │   ├── constants.ts             # App constants
│   │   ├── helpers.ts               # Helper functions
│   │   ├── validators.ts            # Input validation
│   │   ├── formatters.ts            # Data formatting
│   │   ├── dateUtils.ts             # Date/time utilities
│   │   ├── imageUtils.ts            # Image processing
│   │   └── errorHandler.ts          # Error handling
│   │
│   ├── config/                  # Configuration files
│   │   ├── index.ts                 # Main config exports
│   │   ├── environment.ts           # Environment configs
│   │   ├── apiConfig.ts             # API endpoint configs
│   │   ├── paymentConfig.ts         # Payment gateway configs
│   │   └── pushConfig.ts            # Push notification configs
│   │
│   └── assets/                  # Static assets
│       ├── images/
│       ├── icons/
│       ├── fonts/
│       └── animations/
│
├── android/                     # Android native code
├── ios/                         # iOS native code
├── __tests__/                   # Test files
├── App.tsx                      # Root component
├── index.js                     # Entry point
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies

Core Features & Implementation
1. Common Components (app/components/common/)
Button Component
typescript// Usage examples
<Button
  variant="primary"        // primary | secondary | outline | text
  size="medium"           // small | medium | large
  onPress={handleSubmit}
  loading={isLoading}
  disabled={!isValid}
  leftIcon="shopping-cart"
  fullWidth={true}
>
  Add to Cart
</Button>
Input Component
typescript// Usage examples
<Input
  label="Email Address"
  placeholder="Enter your email"
  leftIcon="email"
  value={email}
  onChangeText={setEmail}
  error={emailError}
  required={true}
  keyboardType="email-address"
  autoCapitalize="none"
/>
Header Component
typescript// Usage examples
<Header
  title="Fresh Vegetables"
  showBack={true}
  onBack={() => navigation.goBack()}
  rightActions={[
    {icon: 'search', onPress: () => setShowSearch(true)},
    {icon: 'shopping-cart', onPress: () => navigation.navigate('Cart'), badge: cartItemCount}
  ]}
/>
Loader Component
typescript// Usage examples
<InlineLoader size="small" color="#4CAF50" />
<OverlayLoader visible={isLoading} text="Loading products..." />
<SkeletonLoader type="productCard" count={6} />
Modal Component
typescript// Usage examples
<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Order"
  size="medium"
  actions={[
    {text: 'Cancel', onPress: () => setShowModal(false), variant: 'secondary'},
    {text: 'Confirm', onPress: handleConfirmOrder, variant: 'primary'}
  ]}
>
  <OrderSummary order={currentOrder} />
</Modal>
Card Component
typescript// Usage examples
<Card
  variant="elevated"           // flat | elevated | outlined
  onPress={() => navigateToProduct(product.id)}
  padding="medium"
  testID="product-card"
>
  <ProductDetails product={product} />
</Card>

2. Product Components (app/components/product/)
ProductCard Component

Grid/List Variants: Flexible display modes
Features: Add to cart, favorites, quantity selector, badges (organic, discount)
States: Stock management, cart indicators, loading states

typescript<ProductCard
  product={product}
  variant="grid"              // grid | list
  isFavorite={isFavorite}
  onPress={handleProductPress}
  onAddToCart={handleAddToCart}
  onToggleFavorite={handleToggleFavorite}
/>
ProductList Component

Features: Pull to refresh, infinite scroll, view mode toggle
States: Loading, empty, error states
Layout: Responsive grid/list switching

typescript<ProductList
  products={products}
  loading={isLoading}
  hasMore={hasMoreProducts}
  viewMode="grid"             // grid | list
  onProductPress={handleProductPress}
  onLoadMore={handleLoadMore}
  onRefresh={handleRefresh}
  onViewModeChange={setViewMode}
/>
ProductFilter Component

Features: Category filters, price range, organic toggle, sorting
UI: Bottom sheet modal with intuitive controls
Functionality: Real-time filter counting, clear all, apply filters

typescript<ProductFilter
  visible={showFilters}
  onClose={() => setShowFilters(false)}
  onApply={handleApplyFilters}
  initialFilters={currentFilters}
  categories={categories}
  priceRange={{min: 0, max: 1000}}
/>
ProductSearch Component

Features: Debounced search, suggestions, recent/popular searches
Advanced: Voice search, barcode scanning, quick results
UX: Auto-complete, keyboard handling, search history

typescript<ProductSearch
  onSearch={handleSearch}
  onProductSelect={handleProductSelect}
  onFilterPress={() => setShowFilters(true)}
  onScanBarcode={handleBarcodeScanning}
  suggestions={searchSuggestions}
  recentSearches={recentSearches}
  popularSearches={popularSearches}
/>

3. Cart Components (app/components/cart/)
CartItem Component

Features: Quantity controls, remove functionality, price display
States: Editable/read-only modes, loading, stock warnings
Integration: Real-time cart updates, confirmation dialogs

typescript<CartItem
  item={cartItem}
  onQuantityChange={handleQuantityChange}
  onRemove={handleRemoveItem}
  onProductPress={handleProductPress}
  editable={true}
  showProductDetails={true}
/>
CartSummary Component

Features: Detailed breakdown, tax calculations, delivery charges, coupons
Variants: Detailed and simple views
Integration: Delivery slot selection, coupon management

typescript<CartSummary
  cart={cart}
  deliverySlot={selectedSlot}
  deliveryCharge={deliveryCharge}
  taxRate={0.05}              // 5% VAT in UAE
  onEditCoupon={() => setCouponModalVisible(true)}
  onEditDeliverySlot={() => setSlotModalVisible(true)}
  variant="detailed"           // detailed | simple
/>
CouponInput Component

Features: Code input, available coupons list, eligibility checking
States: Applied coupon display, minimum order validation
Integration: Cart discount system, promotional campaigns

typescript<CouponInput
  onApply={handleApplyCoupon}
  onRemove={handleRemoveCoupon}
  currentCoupon={appliedCoupon}
  availableCoupons={availableCoupons}
  cartTotal={cart.totalAmount}
  loading={isApplyingCoupon}
/>

4. Delivery Components (app/components/delivery/)
DeliveryMap Component

Features: Real-time tracking, route display, multiple markers
Integration: Google Maps, Geolocation services
Use Cases: Order tracking, delivery area visualization, address selection

typescript<DeliveryMap
  deliveryAddress={order.deliveryAddress}
  order={currentOrder}
  showTracking={true}
  showRoute={true}
  onMarkerPress={handleMarkerPress}
/>
SlotCalendar Component

Features: Date selection, availability indicators, disabled dates
Integration: react-native-calendars library
UAE Specific: Weekend handling (Friday-Saturday)

typescript<SlotCalendar
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  availableDates={availableSlotDates}
  minDate={new Date()}
  maxDate={sevenDaysFromNow}
/>
TimeSlotGrid Component

Features: Express/Premium slots, capacity indicators, visual feedback
Types: Morning (6AM-12PM), Evening (2PM-8PM), Express (same day)
Use Cases: Time slot selection, availability visualization

typescript<TimeSlotGrid
  slots={availableSlots}
  selectedSlot={selectedSlot}
  onSlotSelect={handleSlotSelect}
  slotType="morning"          // morning | evening | express
/>

5. Payment Components (app/components/payment/)
PaymentMethods Component

Features: Multiple payment types, default selection, secure display
Types: Credit/Debit cards, UPI, Digital wallets, Cash on Delivery
Use Cases: Payment method selection, saved methods management

typescript<PaymentMethods
  paymentMethods={userPaymentMethods}
  selectedMethod={selectedMethod}
  onMethodSelect={setSelectedMethod}
  onAddNewMethod={() => navigation.navigate('AddPayment')}
/>
PaymentForm Component

Features: Multi-payment forms, validation, secure input
Validation: Card numbers, expiry, CVV, UPI IDs
Security: PCI-compliant, masked inputs, encrypted storage

typescript<PaymentForm
  paymentType="card"          // card | upi | wallet
  onSubmit={handlePaymentSubmit}
  loading={isProcessingPayment}
/>
PaymentStatus Component

Features: Animated status display, transaction details, action buttons
States: Success, Failed, Pending, Cancelled, Refunded
Use Cases: Payment confirmation, error handling, status updates

typescript<PaymentStatus
  status="completed"          // completed | failed | pending | cancelled | refunded
  amount={totalAmount}
  currency="AED"
  transactionId="TXN123456"
  orderId={order.id}
  onContinue={handleContinue}
  onGoHome={handleGoHome}
/>

API Endpoints
Authentication Endpoints
POST   /api/auth/register           - User registration
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
POST   /api/auth/refresh-token      - Refresh JWT token
POST   /api/auth/forgot-password    - Password reset request
POST   /api/auth/reset-password     - Password reset confirmation
GET    /api/auth/verify-email       - Email verification
POST   /api/auth/resend-otp         - Resend OTP
Product Endpoints
GET    /api/products                     - Get all products (with pagination)
GET    /api/products/:id                 - Get product by ID
GET    /api/products/category/:category  - Get products by category
GET    /api/products/search?q=query      - Search products
GET    /api/products/featured            - Get featured products
GET    /api/products/seasonal            - Get seasonal products
POST   /api/admin/products               - Create product (Admin)
PUT    /api/admin/products/:id           - Update product (Admin)
DELETE /api/admin/products/:id           - Delete product (Admin)
POST   /api/admin/products/bulk          - Bulk product upload (Admin)
Cart Endpoints
GET    /api/cart                    - Get user cart
POST   /api/cart/add                - Add item to cart
PUT    /api/cart/update/:itemId     - Update cart item quantity
DELETE /api/cart/remove/:itemId     - Remove item from cart
DELETE /api/cart/clear              - Clear entire cart
POST   /api/cart/apply-coupon       - Apply coupon code
DELETE /api/cart/remove-coupon      - Remove applied coupon
Delivery Slot Endpoints
GET    /api/delivery-slots/available        - Get available slots
GET    /api/delivery-slots/date/:date       - Get slots for specific date
POST   /api/delivery-slots/book             - Book a delivery slot
PUT    /api/delivery-slots/:id/modify       - Modify booked slot
DELETE /api/delivery-slots/:id/cancel       - Cancel booked slot
GET    /api/delivery-slots/calculate-charge - Calculate delivery charge
GET    /api/admin/delivery-slots            - Get all slots (Admin)
POST   /api/admin/delivery-slots            - Create slots (Admin)
PUT    /api/admin/delivery-slots/:id        - Update slot (Admin)
Order Endpoints
POST   /api/orders                      - Create new order
GET    /api/orders/user/:userId         - Get user orders
GET    /api/orders/:orderId             - Get order details
PUT    /api/orders/:orderId/status      - Update order status
PUT    /api/orders/:orderId/cancel      - Cancel order
POST   /api/orders/:orderId/reorder     - Reorder past order
GET    /api/admin/orders                - Get all orders (Admin)
PUT    /api/admin/orders/:orderId       - Update order (Admin)
POST   /api/admin/orders/:orderId/refund - Process refund (Admin)
Payment Endpoints
POST   /api/payments/create-intent      - Create payment intent
POST   /api/payments/confirm            - Confirm payment
GET    /api/payments/:paymentId         - Get payment details
POST   /api/payments/methods/add        - Add payment method
GET    /api/payments/methods            - Get saved payment methods
DELETE /api/payments/methods/:methodId  - Delete payment method
POST   /api/payments/refund             - Process refund
User/Profile Endpoints
GET    /api/users/profile               - Get user profile
PUT    /api/users/profile               - Update user profile
POST   /api/users/addresses             - Add address
PUT    /api/users/addresses/:id         - Update address
DELETE /api/users/addresses/:id         - Delete address
GET    /api/users/favorites             - Get favorite products
POST   /api/users/favorites/:productId  - Add to favorites
DELETE /api/users/favorites/:productId  - Remove from favorites
Notification Endpoints
POST   /api/notifications/register-device - Register FCM token
GET    /api/notifications                 - Get user notifications
PUT    /api/notifications/:id/read        - Mark as read
PUT    /api/notifications/read-all        - Mark all as read
POST   /api/admin/notifications/send      - Send notification (Admin)
Admin Endpoints
GET    /api/admin/dashboard             - Dashboard analytics
GET    /api/admin/customers             - Get all customers
GET    /api/admin/sales-report          - Sales report
GET    /api/admin/inventory             - Inventory status
PUT    /api/admin/inventory/:productId  - Update stock
GET    /api/admin/delivery-utilization  - Slot utilization report

Database Schema (MongoDB)
Users Collection
javascript{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  password: String,              // hashed with bcrypt
  role: String,                  // 'customer' | 'admin'
  addresses: [{
    _id: ObjectId,
    type: String,                // 'home' | 'work' | 'other'
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    isDefault: Boolean
  }],
  preferences: {
    organic_only: Boolean,
    dietary_restrictions: [String],
    notification_settings: {
      order_updates: Boolean,
      promotions: Boolean,
      delivery_alerts: Boolean
    }
  },
  payment_methods: [{
    _id: ObjectId,
    type: String,                // 'card' | 'upi' | 'wallet'
    details: Object,             // Encrypted payment details
    isDefault: Boolean
  }],
  fcm_token: String,             // Firebase Cloud Messaging token
  created_at: Date,
  updated_at: Date
}
Products Collection
javascript{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,              // 'vegetables' | 'fruits' | 'grains'
  subcategory: String,
  images: [String],              // Image URLs
  price: Number,
  original_price: Number,        // For discount calculation
  unit: String,                  // 'kg' | 'piece' | 'bundle'
  stock_quantity: Number,
  min_order_quantity: Number,
  max_order_quantity: Number,
  organic: Boolean,
  nutritional_info: {
    calories: Number,
    vitamins: [String],
    protein: Number,
    carbs: Number,
    fat: Number
  },
  seasonal: Boolean,
  available: Boolean,
  featured: Boolean,
  rating: {
    average: Number,
    count: Number
  },
  tags: [String],                // 'fresh', 'local', 'imported'
  created_at: Date,
  updated_at: Date
}
Delivery Slots Collection
javascript{
  _id: ObjectId,
  date: Date,
  time_start: String,            // "09:00"
  time_end: String,              // "12:00"
  capacity: Number,
  booked: Number,
  price: Number,                 // Delivery charge
  type: String,                  // 'standard' | 'express'
  areas: [String],               // Serviceable area codes
  active: Boolean,
  weather_status: String,        // 'clear' | 'suspended'
  created_at: Date
}
Orders Collection
javascript{
  _id: ObjectId,
  user_id: ObjectId,
  order_number: String,          // "ORD-2025-001234"
  items: [{
    product_id: ObjectId,
    product_name: String,
    quantity: Number,
    price: Number,
    unit: String,
    image: String
  }],
  delivery_slot_id: ObjectId,
  delivery_address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {lat: Number, lng: Number},
    delivery_instructions: String
  },
  subtotal: Number,
  delivery_charge: Number,
  tax: Number,                   // 5% VAT in UAE
  discount: Number,
  coupon_code: String,
  total: Number,
  payment_method: String,        // 'card' | 'upi' | 'wallet' | 'cod'
  payment_status: String,        // 'pending' | 'completed' | 'failed' | 'refunded'
  payment_id: String,            // Transaction ID from gateway
  order_status: String,          // 'pending' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled'
  status_history: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  tracking_info: {
    current_location: {lat: Number, lng: Number},
    estimated_arrival: Date
  },
  notes: String,
  cancellation_reason: String,
  refund_amount: Number,
  created_at: Date,
  updated_at: Date
}
Coupons Collection
javascript{
  _id: ObjectId,
  code: String,                  // "FRESH50"
  description: String,
  discount_type: String,         // 'percentage' | 'fixed'
  discount_value: Number,
  min_order_value: Number,
  max_discount: Number,
  valid_from: Date,
  valid_until: Date,
  usage_limit: Number,
  used_count: Number,
  applicable_categories: [String],
  active: Boolean,
  created_at: Date
}
Notifications Collection
javascript{
  _id: ObjectId,
  user_id: ObjectId,
  type: String,                  // 'order_update' | 'promotion' | 'delivery_alert'
  title: String,
  body: String,
  data: Object,                  // Additional payload
  read: Boolean,
  sent_at: Date,
  read_at: Date
}

Custom Hooks
useAuth Hook
typescriptconst {
  user,
  isAuthenticated,
  isLoading,
  login,
  register,
  logout,
  updateProfile,
  resetPassword
} = useAuth();
useCart Hook
typescriptconst {
  items,
  itemCount,
  totalAmount,
  subtotal,
  discount,
  coupon,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon
} = useCart();
useLocation Hook
typescriptconst {
  currentLocation,
  selectedAddress,
  addresses,
  getCurrentLocation,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  checkDeliveryAvailability,
  calculateDeliveryCharge
} = useLocation();
usePayment Hook
typescriptconst {
  paymentMethods,
  selectedMethod,
  isProcessing,
  processPayment,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod
} = usePayment();
useDeliverySlots Hook
typescriptconst {
  availableSlots,
  selectedSlot,
  fetchAvailableSlots,
  bookSlot,
  modifySlot,
  cancelSlot,
  calculateDeliveryCharge
} = useDeliverySlots();
useNotifications
typescriptconst {
  notifications,
  unreadCount,
  hasPermission,
  requestPermission,
  registerDevice,
  markAsRead,
  markAllAsRead,
  updateSettings,
  handleNotificationPress
} = useNotifications();
useAdmin Hook
typescriptconst {
  dashboardData,
  orders,
  products,
  customers,
  isLoading,
  fetchDashboardData,
  updateOrderStatus,
  addProduct,
  updateProduct,
  deleteProduct,
  sendNotification,
  generateReport
} = useAdmin();

Configuration System
Environment Configuration (config/environment.ts)
typescript// Multi-environment support
const Config = {
  // Environment Detection
  ENV: 'development' | 'staging' | 'production',
  
  // API Configuration
  API_BASE_URL: 'https://api.groceryapp.ae/api',
  API_TIMEOUT: 30000,
  
  // Firebase Configuration
  FIREBASE_CONFIG: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  },
  
  // Payment Gateway Keys
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  
  // Google Services
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  
  // Business Rules
  VAT_RATE: 0.05,                    // 5% VAT in UAE
  FREE_DELIVERY_THRESHOLD: 100,      // AED
  MIN_ORDER_VALUE: 20,               // AED
  MAX_COD_AMOUNT: 500,               // AED
  DELIVERY_RADIUS: 25,               // km
  
  // Feature Flags
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_VOICE_SEARCH: true,
  ENABLE_BARCODE_SCANNER: true,
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_SUBSCRIPTION: false,        // Phase 2 feature
  
  // Debug Settings
  ENABLE_DEBUG_LOGS: __DEV__,
  ENABLE_REDUX_LOGGER: __DEV__
};
API Configuration (config/apiConfig.ts)
typescriptexport const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Products
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  PRODUCTS_BY_CATEGORY: '/products/category/:category',
  PRODUCT_SEARCH: '/products/search',
  FEATURED_PRODUCTS: '/products/featured',
  SEASONAL_PRODUCTS: '/products/seasonal',
  
  // Cart
  CART: '/cart',
  CART_ADD: '/cart/add',
  CART_UPDATE: '/cart/update/:itemId',
  CART_REMOVE: '/cart/remove/:itemId',
  CART_CLEAR: '/cart/clear',
  APPLY_COUPON: '/cart/apply-coupon',
  REMOVE_COUPON: '/cart/remove-coupon',
  
  // Delivery Slots
  AVAILABLE_SLOTS: '/delivery-slots/available',
  SLOTS_BY_DATE: '/delivery-slots/date/:date',
  BOOK_SLOT: '/delivery-slots/book',
  MODIFY_SLOT: '/delivery-slots/:id/modify',
  CANCEL_SLOT: '/delivery-slots/:id/cancel',
  CALCULATE_DELIVERY: '/delivery-slots/calculate-charge',
  
  // Orders
  ORDERS: '/orders',
  USER_ORDERS: '/orders/user/:userId',
  ORDER_DETAIL: '/orders/:orderId',
  UPDATE_ORDER_STATUS: '/orders/:orderId/status',
  CANCEL_ORDER: '/orders/:orderId/cancel',
  REORDER: '/orders/:orderId/reorder',
  
  // Payments
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  CONFIRM_PAYMENT: '/payments/confirm',
  PAYMENT_DETAIL: '/payments/:paymentId',
  ADD_PAYMENT_METHOD: '/payments/methods/add',
  PAYMENT_METHODS: '/payments/methods',
  DELETE_PAYMENT_METHOD: '/payments/methods/:methodId',
  PROCESS_REFUND: '/payments/refund',
  
  // User Profile
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  ADDRESSES: '/users/addresses',
  ADD_ADDRESS: '/users/addresses',
  UPDATE_ADDRESS: '/users/addresses/:id',
  DELETE_ADDRESS: '/users/addresses/:id',
  FAVORITES: '/users/favorites',
  ADD_FAVORITE: '/users/favorites/:productId',
  REMOVE_FAVORITE: '/users/favorites/:productId',
  
  // Notifications
  REGISTER_DEVICE: '/notifications/register-device',
  NOTIFICATIONS: '/notifications',
  MARK_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/read-all',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_DETAIL: '/admin/products/:id',
  ADMIN_BULK_UPLOAD: '/admin/products/bulk',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_DETAIL: '/admin/orders/:orderId',
  ADMIN_REFUND: '/admin/orders/:orderId/refund',
  ADMIN_CUSTOMERS: '/admin/customers',
  ADMIN_DELIVERY_SLOTS: '/admin/delivery-slots',
  ADMIN_SLOT_DETAIL: '/admin/delivery-slots/:id',
  ADMIN_SALES_REPORT: '/admin/sales-report',
  ADMIN_INVENTORY: '/admin/inventory',
  ADMIN_UPDATE_STOCK: '/admin/inventory/:productId',
  ADMIN_SEND_NOTIFICATION: '/admin/notifications/send',
  ADMIN_DELIVERY_UTILIZATION: '/admin/delivery-utilization'
};

// HTTP Configuration
export const HTTP_CONFIG = {
  TIMEOUT: 30000,              // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,           // 1 second
  
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Version': '1.0.0',
    'X-Platform': Platform.OS,
    'X-Device-Id': DeviceInfo.getUniqueId()
  }
};

// Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};
Payment Configuration (config/paymentConfig.ts)
typescriptexport const paymentConfig = {
  // Default Gateway
  defaultGateway: 'stripe',
  
  // Gateway Configurations
  gateways: {
    stripe: {
      enabled: true,
      publishableKey: Config.STRIPE_PUBLISHABLE_KEY,
      currency: 'aed',
      supportedMethods: ['card', 'apple_pay', 'google_pay'],
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET
    },
    razorpay: {
      enabled: true,
      keyId: Config.RAZORPAY_KEY_ID,
      currency: 'AED',
      supportedMethods: ['card', 'upi', 'wallet', 'netbanking'],
      webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET
    },
    paypal: {
      enabled: true,
      clientId: Config.PAYPAL_CLIENT_ID,
      currency: 'USD',              // PayPal converts from AED
      supportedMethods: ['paypal'],
      environment: Config.ENV === 'production' ? 'live' : 'sandbox'
    }
  },
  
  // Payment Methods
  paymentMethods: {
    card: {
      enabled: true,
      types: ['visa', 'mastercard', 'amex'],
      cvvRequired: true,
      saveCardOption: true
    },
    upi: {
      enabled: true,
      maxAmount: 200000,           // INR equivalent
      providers: ['googlepay', 'phonepe', 'paytm']
    },
    wallet: {
      enabled: true,
      providers: ['apple_pay', 'google_pay', 'samsung_pay']
    },
    cod: {
      enabled: true,
      minAmount: 20,               // AED
      maxAmount: 500,              // AED
      serviceCharge: 5,            // AED
      restrictedAreas: []          // Area codes where COD not available
    }
  },
  
  // Regional Settings
  regional: {
    country: 'AE',
    currency: 'AED',
    currencySymbol: 'د.إ',
    locale: 'en-AE',
    taxRate: 0.05,                 // 5% VAT
    taxLabel: 'VAT'
  },
  
  // Security
  security: {
    tokenizationEnabled: true,
    threeDSecureEnabled: true,
    fraudDetectionEnabled: true,
    maxRetries: 3,
    sessionTimeout: 600000         // 10 minutes
  },
  
  // Transaction Limits
  limits: {
    minTransaction: 20,            // AED
    maxTransaction: 10000,         // AED
    dailyLimit: 50000,             // AED
    maxRefundDays: 30
  }
};
Push Notification Configuration (config/pushConfig.ts)
typescriptexport const pushConfig = {
  // Firebase Cloud Messaging
  fcm: {
    enabled: true,
    senderId: Config.FIREBASE_CONFIG.messagingSenderId,
    vapidKey: process.env.FIREBASE_VAPID_KEY
  },
  
  // Notification Channels (Android)
  channels: {
    order_updates: {
      id: 'order_updates',
      name: 'Order Updates',
      description: 'Notifications about your order status',
      importance: 'high',
      sound: true,
      vibration: true,
      badge: true,
      lights: true,
      lightColor: '#4CAF50'
    },
    delivery_alerts: {
      id: 'delivery_alerts',
      name: 'Delivery Alerts',
      description: 'Real-time delivery tracking notifications',
      importance: 'high',
      sound: true,
      vibration: true,
      badge: true
    },
    promotions: {
      id: 'promotions',
      name: 'Promotions & Offers',
      description: 'Special deals and promotional offers',
      importance: 'default',
      sound: false,
      vibration: false,
      badge: true
    },
    payment_alerts: {
      id: 'payment_alerts',
      name: 'Payment Alerts',
      description: 'Payment confirmations and issues',
      importance: 'high',
      sound: true,
      vibration: true,
      badge: true
    },
    general: {
      id: 'general',
      name: 'General Notifications',
      description: 'App updates and general information',
      importance: 'low',
      sound: false,
      vibration: false,
      badge: false
    }
  },
  
  // Notification Types
  types: {
    ORDER_PLACED: {
      type: 'order_placed',
      channel: 'order_updates',
      title: 'Order Placed Successfully',
      priority: 'high',
      data: {screen: 'OrderDetails'}
    },
    ORDER_CONFIRMED: {
      type: 'order_confirmed',
      channel: 'order_updates',
      title: 'Order Confirmed',
      priority: 'high',
      data: {screen: 'OrderDetails'}
    },
    ORDER_PACKED: {
      type: 'order_packed',
      channel: 'order_updates',
      title: 'Order Packed',
      priority: 'high',
      data: {screen: 'OrderTracking'}
    },
    OUT_FOR_DELIVERY: {
      type: 'out_for_delivery',
      channel: 'delivery_alerts',
      title: 'Out for Delivery',
      priority: 'high',
      data: {screen: 'OrderTracking'}
    },
    DELIVERED: {
      type: 'delivered',
      channel: 'delivery_alerts',
      title: 'Order Delivered',
      priority: 'high',
      data: {screen: 'OrderDetails'}
    },
    PAYMENT_SUCCESS: {
      type: 'payment_success',
      channel: 'payment_alerts',
      title: 'Payment Successful',
      priority: 'high',
      data: {screen: 'OrderDetails'}
    },
    PAYMENT_FAILED: {
      type: 'payment_failed',
      channel: 'payment_alerts',
      title: 'Payment Failed',
      priority: 'high',
      data: {screen: 'Cart'}
    },
    PROMOTION: {
      type: 'promotion',
      channel: 'promotions',
      title: 'Special Offer',
      priority: 'default',
      data: {screen: 'Home'}
    }
  },
  
  // Action Categories (iOS/Android)
  actions: {
    order_actions: {
      id: 'order_actions',
      actions: [
        {id: 'view', title: 'View Order', foreground: true},
        {id: 'track', title: 'Track Order', foreground: true}
      ]
    },
    delivery_actions: {
      id: 'delivery_actions',
      actions: [
        {id: 'track', title: 'Track', foreground: true},
        {id: 'contact', title: 'Contact Driver', foreground: true}
      ]
    },
    promotion_actions: {
      id: 'promotion_actions',
      actions: [
        {id: 'view', title: 'View Offer', foreground: true},
        {id: 'dismiss', title: 'Dismiss', foreground: false}
      ]
    }
  },
  
  // Deep Linking
  deepLinking: {
    scheme: 'groceryapp',
    prefixes: [
      'groceryapp://',
      'https://groceryapp.ae',
      'https://www.groceryapp.ae'
    ],
    config: {
      screens: {
        Home: 'home',
        ProductDetails: 'product/:productId',
        Category: 'category/:categoryName',
        Cart: 'cart',
        Checkout: 'checkout',
        OrderDetails: 'order/:orderId',
        OrderTracking: 'order/:orderId/track',
        Profile: 'profile'
      }
    }
  },
  
  // Scheduling
  scheduling: {
    quietHours: {
      enabled: true,
      start: '22:00',              // 10 PM
      end: '08:00'                 // 8 AM
    },
    batchDelay: 300000,            // 5 minutes
    maxBatchSize: 10
  }
};

// Notification Type Constants
export const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PACKED: 'order_packed',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  PROMOTION: 'promotion'
};
App Constants (config/index.ts)
typescript// Main Configuration Export
export default Config;

// App Constants
export const APP_CONSTANTS = {
  APP_NAME: 'Fresh Grocery',
  APP_VERSION: '1.0.0',
  
  // Business Rules
  BUSINESS_RULES: {
    MIN_ORDER_VALUE: 20,              // AED
    FREE_DELIVERY_THRESHOLD: 100,     // AED
    MAX_COD_AMOUNT: 500,              // AED
    VAT_RATE: 0.05,                   // 5%
    DELIVERY_RADIUS: 25,              // km
    CANCELLATION_WINDOW: 30,          // minutes
    REFUND_PROCESSING_DAYS: 5         // days
  },
  
  // Delivery Charges
  DELIVERY_CHARGES: {
    STANDARD: 10,                     // AED
    EXPRESS: 15,                      // AED
    SAME_DAY: 20,                     // AED
    FREE_THRESHOLD: 100               // AED
  },
  
  // Product Categories
  CATEGORIES: [
    {id: 'vegetables', name: 'Fresh Vegetables', icon: 'leaf'},
    {id: 'fruits', name: 'Fresh Fruits', icon: 'apple'},
    {id: 'organic_vegetables', name: 'Organic Vegetables', icon: 'eco'},
    {id: 'organic_fruits', name: 'Organic Fruits', icon: 'spa'},
    {id: 'rice_grains', name: 'Rice & Grains', icon: 'grain'}
  ],
  
  // Order Statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PACKED: 'packed',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },
  
  // Payment Statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
  },
  
  // Slot Types
  SLOT_TYPES: {
    MORNING: 'morning',
    EVENING: 'evening',
    EXPRESS: 'express'
  },
  
  // Units
  UNITS: {
    KG: 'kg',
    PIECE: 'piece',
    BUNDLE: 'bundle',
    GRAM: 'gram',
    LITER: 'liter'
  },
  
  // Pagination
  PAGINATION: {
    PRODUCTS_PER_PAGE: 20,
    ORDERS_PER_PAGE: 10,
    NOTIFICATIONS_PER_PAGE: 20
  }
};

// Regional Settings
export const REGIONAL_SETTINGS = {
  COUNTRY: 'AE',
  COUNTRY_NAME: 'United Arab Emirates',
  CURRENCY: 'AED',
  CURRENCY_SYMBOL: 'د.إ',
  CURRENCY_NAME: 'UAE Dirham',
  TIMEZONE: 'Asia/Dubai',
  LOCALE: 'en-AE',
  PHONE_CODE: '+971',
  WEEKEND_DAYS: [5, 6],               // Friday, Saturday
  VAT_RATE: 0.05,                     // 5%
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  FIRST_DAY_OF_WEEK: 6                // Saturday
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_VOICE_SEARCH: true,
  ENABLE_BARCODE_SCANNER: true,
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_DARK_MODE: true,
  ENABLE_ARABIC_LANGUAGE: true,
  ENABLE_SUBSCRIPTION: false,          // Phase 2
  ENABLE_MULTI_VENDOR: false,          // Phase 2
  ENABLE_AR_PREVIEW: false,            // Phase 2
  ENABLE_LOYALTY_PROGRAM: true,
  ENABLE_REFERRAL_PROGRAM: true,
  ENABLE_CHAT_SUPPORT: false           // Phase 2
};

// Colors
export const COLORS = {
  PRIMARY: '#4CAF50',
  PRIMARY_DARK: '#388E3C',
  PRIMARY_LIGHT: '#C8E6C9',
  SECONDARY: '#FF9800',
  ACCENT: '#2196F3',
  ERROR: '#F44336',
  WARNING: '#FFC107',
  SUCCESS: '#4CAF50',
  INFO: '#2196F3',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#F5F5F5',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  DIVIDER: '#BDBDBD',
  BORDER: '#E0E0E0'
};

// Export all configurations
export {
  API_ENDPOINTS,
  HTTP_CONFIG,
  HTTP_STATUS,
  paymentConfig,
  pushConfig,
  NOTIFICATION_TYPES
};

UAE Market Specific Features
Currency & Localization

Currency: AED (د.إ) with proper formatting
VAT: 5% tax rate as per UAE regulations
Timezone: Asia/Dubai (UTC+4)
Weekend: Friday-Saturday
Languages: English (primary), Arabic (supported)

Business Rules

Free Delivery Threshold: 100 AED
Minimum Order Value: 20 AED
COD Limits: 20-500 AED
Express Delivery Charge: 15 AED
Standard Delivery Charge: 10 AED
Delivery Radius: 25 km from store
Order Cancellation Window: 30 minutes

Payment Methods

Credit/Debit Cards (Visa, Mastercard, Amex)
Digital Wallets (Apple Pay, Google Pay)
UPI Payments (for Indian expats)
Cash on Delivery (COD) - Popular in UAE
PayPal (for international cards)

Delivery Slots

Morning: 6:00 AM - 12:00 PM
Evening: 2:00 PM - 8:00 PM
Express: Same-day delivery (premium charge)
Scheduled: Up to 7 days in advance
Weekend Consideration: Friday-Saturday

Regional Considerations

Store Location: Abu Dhabi coordinates as default
Service Areas: Emirates-based delivery zones
Local Preferences: Organic produce, fresh daily delivery
Cultural Sensitivity: Halal products, Ramadan timing adjustments


Security & Compliance
Authentication Security

JWT token-based authentication with refresh tokens
Password encryption using bcrypt (min 10 salt rounds)
Session management with token expiry
Role-based access control (Customer, Admin)
Biometric authentication support (Face ID, Touch ID)

Data Protection

HTTPS for all API communications
Input validation and sanitization
SQL injection prevention
XSS (Cross-Site Scripting) protection
CSRF (Cross-Site Request Forgery) tokens
Rate limiting on API endpoints

Payment Security

PCI DSS compliance for card processing
Payment tokenization
3D Secure authentication
Encrypted payment data storage
Fraud detection mechanisms
Secure payment gateway integrations

Privacy Compliance

User data encryption at rest and in transit
GDPR-ready data handling
User consent management
Right to data deletion
Privacy policy and terms of service
Cookie consent management


Performance Requirements
App Performance

App Load Time: < 3 seconds
API Response Time: < 500ms
Image Loading: Lazy loading with placeholders
Offline Capability: Cached data for browsing
Bundle Size: Optimized for minimal download

Scalability

Concurrent Users: Support for 1000+ users
Uptime: 99.9% availability
Database: Indexed queries, connection pooling
CDN: Image and asset delivery optimization
Load Balancing: Horizontal scaling ready

Monitoring

Application Performance Monitoring (APM)
Error Tracking: Sentry/Crashlytics integration
Analytics: Firebase/Google Analytics
Server Health: CPU, memory, disk monitoring
Security Audit Logging: Track sensitive operations


Testing Strategy
Unit Testing

Component testing with React Testing Library
Service/API testing with Jest
Redux store testing
Custom hooks testing
Utility function testing

Integration Testing

API integration tests
Payment gateway testing
Push notification testing
Navigation flow testing
End-to-end user journeys

Performance Testing

Load testing for concurrent users
Stress testing for peak loads
API response time benchmarking
Memory leak detection
Battery usage optimization


Deployment
Environment Setup

Development: Local development with mock data
Staging: Pre-production testing environment
Production: Live production environment

CI/CD Pipeline

Automated testing on commits
Code quality checks (ESLint, TypeScript)
Build automation
Automated deployments
Rollback mechanisms

App Store Deployment

iOS: App Store submission process
Android: Google Play Store submission
App review guidelines compliance
Beta testing with TestFlight/Internal Testing
Gradual rollout strategy


Future Enhancements (Phase 2)
Subscription Service

Recurring weekly/monthly orders
Customizable subscription boxes
Subscription management

AI Features

Product recommendations
Predictive inventory
Dynamic pricing
Customer behavior analysis

Advanced Features

AR product preview
Multi-vendor marketplace
Community features (reviews, recipes)
GPS delivery tracking
Voice ordering
Chat support


Development Guidelines
Code Standards

TypeScript: Strict mode enabled
Naming: camelCase for variables, PascalCase for components
File Structure: Feature-based organization
Comments: JSDoc for public APIs
Testing: Minimum 80% code coverage

Git Workflow

Branching: feature/, bugfix/, hotfix/ prefixes
Commits: Conventional commit messages
Pull Requests: Required reviews before merge
Tags: Semantic versioning (v1.0.0)

Component Guidelines

Functional components with hooks
Props interface definitions
Default props where applicable
TestID for all interactive elements
Accessibility considerations
Performance optimization (memo, useMemo, useCallback)


Quick Reference: Component Usage
Common Components
typescript// Button
<Button variant="primary" size="medium" onPress={handlePress} loading={isLoading} />

// Input
<Input label="Email" value={email} onChangeText={setEmail} error={error} />

// Header
<Header title="Products" showBack={true} rightActions={[{icon: 'cart', onPress: goToCart}]} />

// Loader
<OverlayLoader visible={isLoading} text="Please wait..." />

// Modal
<Modal visible={show} onClose={handleClose} title="Confirm" actions={actions} />

// Card
<Card variant="elevated" onPress={handlePress}><Content /></Card>
Product Components
typescript<ProductCard product={product} variant="grid" onAddToCart={handleAdd} />
<ProductList products={products} onLoadMore={loadMore} viewMode="grid" />
<ProductFilter visible={true} onApply={handleFilter} categories={categories} />
<ProductSearch onSearch={handleSearch} suggestions={suggestions} />
Cart Components
typescript<CartItem item={item} onQuantityChange={handleChange} editable={true} />
<CartSummary cart={cart} deliverySlot={slot} variant="detailed" />
<CouponInput onApply={handleApply} availableCoupons={coupons} />
Delivery Components
typescript<DeliveryMap deliveryAddress={address} showTracking={true} />
<SlotCalendar selectedDate={date} onDateSelect={setDate} />
<TimeSlotGrid slots={slots} onSlotSelect={handleSelect} />
Payment Components
typescript<PaymentMethods paymentMethods={methods} selectedMethod={selected} />
<PaymentForm paymentType="card" onSubmit={handleSubmit} />
<PaymentStatus status="completed" amount={total} currency="AED" />

This context document provides a comprehensive foundation for building the organic produce delivery application. All code examples are production-ready and follow React Native and TypeScript best practices.