/**
 * Web stub for expo-splash-screen
 * Provides splash screen functionality for web
 */

// Mock requireOptionalNativeModule for splash screen
export const requireOptionalNativeModule = (moduleName) => {
  if (moduleName === 'ExpoSplashScreen') {
    return {
      hideAsync: () => Promise.resolve(),
      preventAutoHideAsync: () => Promise.resolve(),
    };
  }
  return null;
};

export const SplashScreen = {
  preventAutoHideAsync: () => Promise.resolve(),
  hideAsync: () => Promise.resolve(),
  isHidden: () => true,
  setOptions: () => {},
};

// Export for different import patterns
export default SplashScreen;
module.exports = SplashScreen;
module.exports.default = SplashScreen;
module.exports.requireOptionalNativeModule = requireOptionalNativeModule;