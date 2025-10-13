/**
 * Web stub for React Native's BatchedBridge
 * Prevents Metro import errors on web platform
 */

// Mock BatchedBridge for web compatibility
const BatchedBridge = {
  registerCallableModule: () => {},
  registerLazyCallableModule: () => {},
  callFunctionReturnFlushedQueue: () => null,
  callFunctionReturnResultAndFlushedQueue: () => [null, null],
  flushedQueue: () => null,
  invokeCallbackAndReturnFlushedQueue: () => null,
  setGlobalHandler: () => {},
  
  // Compatibility methods
  enqueueNativeCall: () => {},
  createDebugLookup: () => ({}),
};

// Global bridge configuration for web
if (typeof global !== 'undefined') {
  global.__fbBatchedBridgeConfig = {
    remoteModuleConfig: [],
    localModulesConfig: [],
  };
  
  global.__fbBatchedBridge = BatchedBridge;
}

export default BatchedBridge;
module.exports = BatchedBridge;