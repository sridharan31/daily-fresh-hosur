/**
 * Web stub for react-native-worklets
 * Prevents worklets version mismatch errors on web
 */

// Mock the version checking to prevent errors
const mockVersion = '0.6.0';

// Mock worklets functions
export const runOnJS = (fn) => {
  return (...args) => {
    return fn(...args);
  };
};

export const runOnUI = (fn) => {
  return (...args) => {
    return fn(...args);
  };
};

export const createSharedValue = (initialValue) => {
  return {
    value: initialValue,
    _value: initialValue,
    addListener: () => ({ remove: () => {} }),
    removeListener: () => {},
    modify: (modifier) => {
      if (typeof modifier === 'function') {
        return modifier(this.value);
      }
      return modifier;
    }
  };
};

export const useDerivedValue = (fn, deps) => {
  try {
    return { value: fn() };
  } catch {
    return { value: null };
  }
};

export const useSharedValue = (initialValue) => {
  return createSharedValue(initialValue);
};

export const withTiming = (value, config) => value;
export const withSpring = (value, config) => value;
export const withDelay = (delay, animation) => animation;
export const withSequence = (...animations) => animations[animations.length - 1];
export const withRepeat = (animation, numberOfReps) => animation;

// Default export
export default {
  runOnJS,
  runOnUI,
  createSharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
};