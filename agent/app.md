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


When assisting with this project: Prioritize security, scalability, and user experience. The delivery slot management system is a core differentiator. Always consider mobile-first design patterns and ensure code follows React Native and Node.js best practices.