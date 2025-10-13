/**
 * Web stub for React Native's NativeModules
 * Prevents Metro import errors on web platform
 */

// Mock NativeModules for web compatibility
const NativeModules = {};

// Mock TurboModuleRegistry
const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => null,
};

// Export for different import patterns
export { NativeModules, TurboModuleRegistry };
export default NativeModules;
module.exports = NativeModules;
module.exports.TurboModuleRegistry = TurboModuleRegistry;