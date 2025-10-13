/**
 * Web stub for React Native Firebase modules
 * Provides comprehensive Firebase compatibility for web
 */

// Mock Firebase app
const FirebaseApp = {
  name: 'web-app',
  options: {},
  delete: () => Promise.resolve(),
  onReady: () => Promise.resolve(),
};

// Mock analytics
const analytics = () => ({
  logEvent: () => Promise.resolve(),
  setUserProperties: () => Promise.resolve(),
  setUserId: () => Promise.resolve(),
  setCurrentScreen: () => Promise.resolve(),
  setAnalyticsCollectionEnabled: () => Promise.resolve(),
  resetAnalyticsData: () => Promise.resolve(),
});

// Mock crashlytics
const crashlytics = () => ({
  recordError: () => Promise.resolve(),
  log: () => Promise.resolve(),
  setUserId: () => Promise.resolve(),
  setAttributes: () => Promise.resolve(),
  checkForUnsentReports: () => Promise.resolve(false),
  deleteUnsentReports: () => Promise.resolve(),
  didCrashOnPreviousExecution: () => Promise.resolve(false),
  sendUnsentReports: () => Promise.resolve(),
  setCrashlyticsCollectionEnabled: () => Promise.resolve(),
});

// Mock messaging
const messaging = () => ({
  requestPermission: () => Promise.resolve(true),
  getToken: () => Promise.resolve('web-token'),
  onMessage: () => () => {},
  onTokenRefresh: () => () => {},
  subscribeToTopic: () => Promise.resolve(),
  unsubscribeFromTopic: () => Promise.resolve(),
  hasPermission: () => Promise.resolve(true),
  deleteToken: () => Promise.resolve(),
  getInitialNotification: () => Promise.resolve(null),
  onNotificationOpenedApp: () => () => {},
  setBackgroundMessageHandler: () => {},
});

// Mock auth
const auth = () => ({
  currentUser: null,
  signInAnonymously: () => Promise.resolve({ user: { uid: 'web-user' } }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {},
  onIdTokenChanged: () => () => {},
  onUserChanged: () => () => {},
});

// Mock firestore
const firestore = () => ({
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      onSnapshot: () => () => {},
    }),
    add: () => Promise.resolve({ id: 'web-doc-id' }),
    get: () => Promise.resolve({ empty: true, docs: [] }),
    where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }),
  }),
  doc: () => ({
    get: () => Promise.resolve({ exists: false, data: () => ({}) }),
    set: () => Promise.resolve(),
    update: () => Promise.resolve(),
    delete: () => Promise.resolve(),
  }),
  batch: () => ({
    set: () => {},
    update: () => {},
    delete: () => {},
    commit: () => Promise.resolve(),
  }),
  runTransaction: (fn) => Promise.resolve(fn({
    get: () => Promise.resolve({ exists: false, data: () => ({}) }),
    set: () => {},
    update: () => {},
    delete: () => {},
  })),
});

// Mock app instance
const app = () => FirebaseApp;

// Mock firebase module structure
const firebase = {
  app,
  analytics,
  crashlytics,
  messaging,
  auth,
  firestore,
  apps: [FirebaseApp],
  SDK_VERSION: '18.0.0',
};

// Export for different import patterns
export default firebase;
export { analytics, app, auth, crashlytics, firestore, messaging };

// Also export the individual modules as they might be imported separately
module.exports = firebase;
module.exports.default = firebase;
module.exports.app = app;
module.exports.analytics = analytics;
module.exports.crashlytics = crashlytics;
module.exports.messaging = messaging;
module.exports.auth = auth;
module.exports.firestore = firestore;
