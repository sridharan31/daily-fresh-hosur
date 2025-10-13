# FreshCart - Grocery Delivery App

A comprehensive React Native grocery delivery application built with Expo, featuring both customer and admin functionality.

## 🚀 Features

### Customer Features
- **Authentication**: Login, registration, OTP verification, password reset
- **Product Browsing**: Browse categories, search products, view details
- **Shopping Cart**: Add/remove items, apply coupons, manage quantities
- **Delivery**: Select delivery slots, track orders, manage addresses
- **Order Management**: View order history, track deliveries, reorder
- **Profile**: Manage personal information, addresses, payment methods

### Admin Features
- **Dashboard**: Overview of orders, sales, customers, and inventory
- **Product Management**: Add, edit, delete products, manage categories
- **Order Management**: View, update order status, manage refunds
- **Customer Management**: View customer details, communication tools
- **Inventory Management**: Track stock levels, manage suppliers
- **Analytics**: Sales reports, customer insights, delivery analytics

## 📁 Project Structure

```
grocery-delivery-app/
├── app/                     # Main application directory
│   ├── components/          # Reusable React components
│   │   ├── common/         # Common UI components
│   │   ├── product/        # Product-related components
│   │   ├── cart/           # Shopping cart components
│   │   ├── delivery/       # Delivery-related components
│   │   └── payment/        # Payment components
│   │
│   ├── screens/            # App screens
│   │   ├── auth/           # Authentication screens
│   │   ├── home/           # Home and product screens
│   │   ├── cart/           # Cart and checkout screens
│   │   ├── orders/         # Order management screens
│   │   ├── delivery/       # Delivery screens
│   │   └── admin/          # Admin dashboard screens
│   │
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services and business logic
│   │   ├── api/            # API service layer
│   │   ├── payment/        # Payment gateways
│   │   ├── storage/        # Local storage services
│   │   ├── location/       # Location services
│   │   └── push/           # Push notifications
│   │
│   ├── store/              # Redux store configuration
│   │   ├── slices/         # Redux slices
│   │   └── middleware/     # Redux middleware
│   │
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── config/             # App configuration
│   └── assets/             # Static assets
│
├── android/                # Android-specific files
├── ios/                    # iOS-specific files
├── __tests__/              # Test files
├── App.tsx                 # Main app component
├── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation v6
- **UI Components**: Custom components with React Native
- **Storage**: AsyncStorage & Redux Persist
- **Animation**: React Native Reanimated
- **Maps**: React Native Maps
- **Icons**: React Native Vector Icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd grocery-delivery-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

## 🔧 Configuration

### Environment Setup

Create environment configuration files in `app/config/`:

- `environment.ts` - Main environment configuration
- `apiConfig.ts` - API endpoints and configuration
- `paymentConfig.ts` - Payment gateway configuration
- `pushConfig.ts` - Push notification configuration

### API Configuration

Update the API base URL in `app/config/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api-endpoint.com/api',
  TIMEOUT: 10000,
  // ... other configurations
};
```

### Payment Gateways

Configure payment providers in `app/config/paymentConfig.ts`:

```typescript
export const PAYMENT_CONFIG = {
  STRIPE_PUBLISHABLE_KEY: 'your-stripe-key',
  RAZORPAY_KEY_ID: 'your-razorpay-key',
  PAYPAL_CLIENT_ID: 'your-paypal-client-id',
};
```

## 🚀 Running the App

### Development

```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on web
npx expo start --web
```

### Building for Production

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📱 Features by Screen

### Authentication Flow
- **Welcome Screen**: App introduction and onboarding
- **Login/Register**: User authentication with OTP verification
- **Password Reset**: Secure password recovery flow

### Shopping Flow
- **Home Screen**: Featured products, categories, search
- **Product Details**: Detailed product information, reviews
- **Cart**: Manage cart items, apply coupons
- **Checkout**: Select delivery slot, payment method
- **Order Confirmation**: Order summary and tracking

### Admin Dashboard
- **Dashboard**: Business metrics and quick actions
- **Product Management**: CRUD operations for products
- **Order Management**: Process and track orders
- **Analytics**: Comprehensive business insights

## 🔒 Security Features

- Secure authentication with JWT tokens
- Data encryption for sensitive information
- Input validation and sanitization
- Secure API communication (HTTPS)
- User session management

## 🚀 Performance Optimizations

- Lazy loading of screens and components
- Image optimization and caching
- Efficient list rendering with FlatList
- Redux state optimization
- Background task management

## 🌐 Internationalization

The app supports multiple languages:
- English (default)
- Spanish
- French
- German

## 📊 Analytics Integration

- User behavior tracking
- Purchase analytics
- Performance monitoring
- Crash reporting

## 🔧 Customization

### Theming
Modify colors and styles in:
- `constants/Colors.ts`
- Component style files

### Business Logic
Update business rules in:
- `services/business/`
- `utils/constants.ts`

## 🚨 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install --repo-update
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@freshcart.com
- Documentation: [Link to docs]
- Issue Tracker: [Link to issues]

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added admin dashboard
- **v1.2.0** - Enhanced analytics and reporting

---

Built with ❤️ for fresh grocery delivery
