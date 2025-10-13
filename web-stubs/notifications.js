// web-stubs/notifications.js

const configure = (options) => {
  console.log('Push notifications configured for web:', options);
  
  // Call onNotification callback if provided to prevent errors
  if (options && options.onNotification) {
    // Don't call it immediately to avoid issues
  }
  
  // Return a value to prevent null/undefined errors
  return true;
};

const localNotification = (notification) => {
  console.log('Local notification (web):', notification);
  
  // Use browser notification API if available
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title || 'Notification', {
      body: notification.message || notification.body,
      icon: notification.largeIcon || notification.smallIcon,
    });
  }
};

const requestPermissions = () => {
  if ('Notification' in window) {
    return Notification.requestPermission().then(permission => ({
      alert: permission === 'granted',
      badge: permission === 'granted',
      sound: permission === 'granted',
    }));
  }
  return Promise.resolve({ alert: false, badge: false, sound: false });
};

const checkPermissions = () => {
  const granted = 'Notification' in window && Notification.permission === 'granted';
  return Promise.resolve({
    alert: granted,
    badge: granted,
    sound: granted,
  });
};

const PushNotification = {
  configure,
  localNotification,
  localNotificationSchedule: localNotification, // Alias for compatibility
  cancelLocalNotification: () => console.log('Cancel notification (web)'),
  cancelAllLocalNotifications: () => console.log('Cancel all notifications (web)'),
  createChannel: (channel, callback) => {
    console.log('Create channel (web):', channel);
    if (callback) callback(true);
  },
  requestPermissions,
  checkPermissions,
  popInitialNotification: () => Promise.resolve(null), // Fix for the 'then' error
  abandonPermissions: () => Promise.resolve(),
  getApplicationIconBadgeNumber: () => Promise.resolve(0),
  setApplicationIconBadgeNumber: () => Promise.resolve(),
};

// Export for both CommonJS and ES modules
module.exports = PushNotification;
module.exports.default = PushNotification;

export default PushNotification;

export {
  checkPermissions, configure,
  localNotification,
  requestPermissions
};

