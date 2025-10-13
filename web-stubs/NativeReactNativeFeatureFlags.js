/**
 * Web stub for React Native Feature Flags
 * Returns safe default values for all feature flags
 */

const NativeReactNativeFeatureFlags = {
  // Common feature flags with safe defaults
  commonTestFlag: () => false,
  allowCollapsableChildren: () => true,
  androidEnablePendingFabricTransactions: () => false,
  batchRenderingUpdatesInEventLoop: () => false,
  destroyFabricSurfacesInReactInstanceManager: () => false,
  enableBackgroundExecutor: () => false,
  enableCleanTextInputYogaNode: () => false,
  enableGranularShadowTreeStateReconciliation: () => false,
  enableMicrotasks: () => false,
  enableSynchronousStateUpdates: () => false,
  enableUIConsistency: () => false,
  fetchImagesInViewPreallocation: () => false,
  fixIncorrectScrollViewStateUpdateOnAndroid: () => false,
  fixMappingOfEventPrioritiesBetweenFabricAndReact: () => false,
  fixMissedFabricStateUpdatesOnAndroid: () => false,
  forceBatchingMountItemsOnAndroid: () => false,
  fuseboxEnabledDebug: () => false,
  fuseboxEnabledRelease: () => false,
  initEagerTurboModulesOnNativeModulesQueueAndroid: () => false,
  lazyAnimationCallbacks: () => false,
  loadVectorDrawablesOnImages: () => false,
  setAndroidLayoutDirection: () => false,
  useImmediateExecutorInAndroidBridgeless: () => false,
  useModernRuntimeScheduler: () => false,
  useNativeViewConfigsInBridgelessMode: () => false,
  useRuntimeShadowNodeReferenceUpdate: () => false,
  useRuntimeShadowNodeReferenceUpdateOnLayout: () => false,
  useStateAlignmentMechanism: () => false,
  useTurboModuleInterop: () => false,
};

export default NativeReactNativeFeatureFlags;
module.exports = NativeReactNativeFeatureFlags;