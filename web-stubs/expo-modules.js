/**
 * Web stub for Expo modules that have react-native dependencies
 */

// Mock Expo modules that might cause react-native import issues
export const NativeModulesProxy = {};
export const EventEmitter = {
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
  removeAllListeners: () => {},
  emit: () => {},
};

export const UnavailabilityError = class extends Error {
  constructor(moduleName, methodName) {
    super(`${moduleName}.${methodName} is not available on this platform.`);
    this.name = 'UnavailabilityError';
  }
};

// Default export
export default {
  NativeModulesProxy,
  EventEmitter,
  UnavailabilityError,
};