/**
 * Web-compatible RCTAlertManager for React Native
 */

const RCTAlertManager = {
  alertWithArgs: (args, callback) => {
    const { title, message, buttons } = args;
    
    if (typeof window !== 'undefined') {
      if (buttons && buttons.length > 1) {
        // For multiple buttons, use confirm
        const result = window.confirm(`${title}\n${message}`);
        if (callback) callback(result ? 0 : 1);
      } else {
        // For single button, use alert
        window.alert(`${title}\n${message}`);
        if (callback) callback(0);
      }
    }
  },
};

module.exports = RCTAlertManager;