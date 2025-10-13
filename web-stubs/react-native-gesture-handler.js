/**
 * Web stub for react-native-gesture-handler
 * Provides basic functionality for web compatibility
 */

import React from 'react';

// Mock GestureHandlerRootView for web
export const GestureHandlerRootView = ({ children, style, ...props }) => {
  return React.createElement('div', { style: { ...style, ...props } }, children);
};

// Mock other gesture handler components
export const PanGestureHandler = ({ children, ...props }) => {
  return React.createElement('div', props, children);
};

export const TapGestureHandler = ({ children, ...props }) => {
  return React.createElement('div', props, children);
};

export const LongPressGestureHandler = ({ children, ...props }) => {
  return React.createElement('div', props, children);
};

// Mock gesture states
export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

// Mock directions
export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

// Default export
export default {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  State,
  Directions,
};