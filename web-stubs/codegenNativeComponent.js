// Web stub for react-native codegenNativeComponent
import React from 'react';

export default function codegenNativeComponent(name, options = {}) {
  const Component = React.forwardRef((props, ref) => {
    return React.createElement('div', {
      ...props,
      ref,
      style: { display: 'none' },
      'data-testid': `mock-${name}`,
    });
  });
  
  Component.displayName = name;
  return Component;
}

// Export additional utilities that Stripe might need
export const Commands = {};
export const codegenNativeCommands = () => ({});
