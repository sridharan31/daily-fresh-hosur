/**
 * Web-compatible BackHandler for React Native
 */

const BackHandler = {
  exitApp: () => {
    if (typeof window !== 'undefined') {
      window.close();
    }
  },
  
  addEventListener: (eventName, handler) => {
    if (eventName === 'hardwareBackPress' && typeof window !== 'undefined') {
      const handleBackButton = (event) => {
        const shouldPreventDefault = handler();
        if (shouldPreventDefault) {
          event.preventDefault();
          return false;
        }
      };
      
      window.addEventListener('popstate', handleBackButton);
      
      return {
        remove: () => {
          window.removeEventListener('popstate', handleBackButton);
        },
      };
    }
    
    return { remove: () => {} };
  },
  
  removeEventListener: (eventName, handler) => {
    // Handled by the subscription object returned by addEventListener
  },
};

module.exports = BackHandler;