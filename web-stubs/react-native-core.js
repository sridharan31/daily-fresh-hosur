/**
 * Comprehensive React Native core module blocker for web
 * This stub blocks all React Native internals that shouldn't be imported on web
 */

// Block all React Native core imports
const blockReactNative = () => {
  console.warn('React Native core module blocked on web platform');
  return {};
};

// Export various formats to catch different import patterns
export default blockReactNative;
export const NativeModules = {};
export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null,
};
export const BatchedBridge = {
  registerCallableModule: () => {},
  registerLazyCallableModule: () => {},
  callFunctionReturnFlushedQueue: () => null,
  callFunctionReturnResultAndFlushedQueue: () => [null, null],
  flushedQueue: () => null,
  invokeCallbackAndReturnFlushedQueue: () => null,
  setGlobalHandler: () => {},
};
export const Platform = {
  OS: 'web',
  Version: '1.0.0',
  isTV: false,
  isTesting: false,
  select: (obj) => obj.web || obj.default,
};
export const ReactNativeFeatureFlags = {};

// Legacy module.exports support
module.exports = blockReactNative;
module.exports.default = blockReactNative;
module.exports.NativeModules = {};
module.exports.TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null,
};
module.exports.BatchedBridge = {
  registerCallableModule: () => {},
  registerLazyCallableModule: () => {},
  callFunctionReturnFlushedQueue: () => null,
  callFunctionReturnResultAndFlushedQueue: () => [null, null],
  flushedQueue: () => null,
  invokeCallbackAndReturnFlushedQueue: () => null,
  setGlobalHandler: () => {},
};
module.exports.Platform = {
  OS: 'web',
  Version: '1.0.0',
  isTV: false,
  isTesting: false,
  select: (obj) => obj.web || obj.default,
};
module.exports.ReactNativeFeatureFlags = {};