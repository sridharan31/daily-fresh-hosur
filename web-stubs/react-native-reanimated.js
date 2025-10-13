/**
 * Web stub for react-native-reanimated
 * Provides basic functionality without native animations
 */

import React from 'react';

// Mock Animated components
export const View = ({ children, style, ...props }) => {
  return React.createElement('div', { style: { ...style, ...props } }, children);
};

export const Text = ({ children, style, ...props }) => {
  return React.createElement('span', { style: { ...style, ...props } }, children);
};

export const ScrollView = ({ children, style, ...props }) => {
  return React.createElement('div', { 
    style: { 
      ...style, 
      overflow: 'auto',
      ...props 
    } 
  }, children);
};

// Mock animation functions
export const useSharedValue = (initialValue) => {
  return {
    value: initialValue,
    _value: initialValue,
    addListener: () => ({ remove: () => {} }),
    removeListener: () => {},
  };
};

export const useAnimatedStyle = (fn, deps) => {
  try {
    return fn() || {};
  } catch {
    return {};
  }
};

export const useAnimatedGestureHandler = (handlers) => {
  return {};
};

export const useDerivedValue = (fn, deps) => {
  try {
    return { value: fn() };
  } catch {
    return { value: null };
  }
};

export const runOnJS = (fn) => {
  return (...args) => fn(...args);
};

export const runOnUI = (fn) => {
  return (...args) => fn(...args);
};

// Animation functions
export const withTiming = (value, config) => value;
export const withSpring = (value, config) => value;
export const withDelay = (delay, animation) => animation;
export const withSequence = (...animations) => animations[animations.length - 1];
export const withRepeat = (animation, numberOfReps) => animation;
export const cancelAnimation = (sharedValue) => {};

// Gesture functions
export const Gesture = {
  Pan: () => ({}),
  Tap: () => ({}),
  LongPress: () => ({}),
  Fling: () => ({}),
  Pinch: () => ({}),
  Rotation: () => ({}),
};

// Animated component
export const Animated = {
  View,
  Text,
  ScrollView,
  createAnimatedComponent: (Component) => Component,
};

// Default export
export default {
  View,
  Text,
  ScrollView,
  Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useDerivedValue,
  runOnJS,
  runOnUI,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
  Gesture,
};