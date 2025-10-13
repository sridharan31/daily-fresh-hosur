// web-stubs/react-native-svg.js
import React from 'react';

const createComponent = (name) => {
  return React.forwardRef((props, ref) => {
    const { children, width, height, viewBox, fill, stroke, strokeWidth, ...rest } = props;
    
    if (name === 'Svg') {
      return React.createElement('svg', {
        ref,
        width: width || '100%',
        height: height || '100%',
        viewBox,
        ...rest,
      }, children);
    }
    
    const tagMap = {
      'G': 'g',
      'Path': 'path',
      'Rect': 'rect',
      'Text': 'text',
      'Circle': 'circle',
      'Line': 'line',
      'Defs': 'defs',
      'LinearGradient': 'linearGradient',
      'Stop': 'stop',
      'Polygon': 'polygon',
    };
    
    return React.createElement(tagMap[name] || 'g', {
      ...rest,
      ref,
      fill,
      stroke,
      strokeWidth,
    }, children);
  });
};

export const Svg = createComponent('Svg');
export const G = createComponent('G');
export const Path = createComponent('Path');
export const Rect = createComponent('Rect');
export const Text = createComponent('Text');
export const Circle = createComponent('Circle');
export const Line = createComponent('Line');
export const Defs = createComponent('Defs');
export const LinearGradient = createComponent('LinearGradient');
export const Stop = createComponent('Stop');
export const Polygon = createComponent('Polygon');

export default {
  Svg, G, Path, Rect, Text, Circle, Line, Defs, LinearGradient, Stop, Polygon
};