# Firebase Configuration Setup Guide

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "grocery-delivery-app")
4. Choose whether to enable Google Analytics (recommended)
5. Select your Google Analytics account or create a new one
6. Click "Create project"

## Step 2: Get Firebase Configuration

1. In your Firebase project, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" → Choose your platform:

### For Web App:
1. Click "</>" icon (Web)
2. Enter your app nickname
3. **Copy the config object** - you'll need this for your `.env` file

### For Android App:
1. Click Android icon
2. Package name: `com.anonymous.grocerydelivery` (from your app.config.json)
3. Download `google-services.json`
4. Place it in `android/app/google-services.json`

### For iOS App:
1. Click iOS icon
2. Bundle ID: `com.anonymous.grocerydelivery` (or your chosen bundle ID)
3. Download `GoogleService-Info.plist`
4. Place it in `ios/GroceryDelivery/GoogleService-Info.plist`

## Step 3: Update Environment Variables

1. Open `.env` file in your project root
2. Replace the placeholder values with your actual Firebase config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Step 4: Enable Firebase Services

In Firebase Console, enable the services you need:

1. **Authentication**: Go to Authentication → Sign-in method → Enable Email/Password
2. **Firestore**: Go to Firestore Database → Create database
3. **Storage**: Go to Storage → Get started
4. **Analytics**: Already enabled if you chose it during setup
5. **Crashlytics**: Go to Crashlytics → Set up Crashlytics
6. **Messaging**: Go to Cloud Messaging → Get started

## Step 5: Install Firebase JS SDK (for web)

```bash
npm install firebase
```

## Step 6: Test Your Setup

1. Start your app: `npm start`
2. Try Firebase authentication and database operations
3. Check Firebase Console for analytics data

## Security Rules

Remember to set up proper security rules for Firestore and Storage:

### Firestore Rules (firestore.rules):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Your security rules here
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules (storage.rules):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=*} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

- **Web app not working**: Make sure you installed `firebase` package
- **Native app not working**: Check that config files are in correct locations
- **Environment variables not loading**: Restart your development server
- **CORS issues**: Firebase handles CORS automatically

## Next Steps

Once configured, you can use Firebase services in your app:

- Authentication (login/signup)
- Firestore database
- Cloud Storage
- Analytics
- Push notifications
- Crash reporting