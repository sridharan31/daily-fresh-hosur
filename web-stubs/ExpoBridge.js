/**
 * Web stub for Expo's React Native bridge
 * Prevents React Native core module imports on web
 */

// Mock __fbBatchedBridgeConfig for web
if (typeof window !== 'undefined') {
  window.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
}

// Mock global bridge
if (typeof global !== 'undefined') {
  global.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
  
  global.__fbBatchedBridge = {
    registerCallableModule: () => {},
    registerLazyCallableModule: () => {},
    callFunctionReturnFlushedQueue: () => null,
    callFunctionReturnResultAndFlushedQueue: () => [null, null],
    flushedQueue: () => null,
    invokeCallbackAndReturnFlushedQueue: () => null,
    setGlobalHandler: () => {},
  };
}

// Export empty object to prevent errors
export default {};
module.exports = {};