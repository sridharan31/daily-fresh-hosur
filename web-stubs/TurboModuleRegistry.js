/**
 * Web stub for React Native's TurboModuleRegistry
 * Prevents Metro import errors on web platform
 */

const TurboModuleRegistry = {
  get: (name) => {
    console.log(`[Web Stub] TurboModuleRegistry.get called for: ${name}`);
    return null;
  },
  getEnforcing: (name) => {
    console.log(`[Web Stub] TurboModuleRegistry.getEnforcing called for: ${name}`);
    return null;
  },
};

export default TurboModuleRegistry;
module.exports = TurboModuleRegistry;