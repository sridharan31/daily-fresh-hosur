// web-stubs/react-native-maps.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Stub MapView component
const MapView = ({ children, style, ...props }) => {
  return React.createElement(View, {
    style: [styles.mapContainer, style],
    ...props
  }, [
    React.createElement(Text, { key: 'mapText', style: styles.mapText }, 'Map View (Web)'),
    children
  ]);
};

// Stub Marker component
const Marker = ({ coordinate, title, description, children, ...props }) => {
  return React.createElement(View, {
    style: styles.marker,
    ...props
  }, [
    React.createElement(Text, { key: 'markerText', style: styles.markerText }, 
      title || `${coordinate?.latitude || 0}, ${coordinate?.longitude || 0}`
    ),
    children
  ]);
};

// Stub Polyline component
const Polyline = ({ coordinates, strokeColor, strokeWidth, ...props }) => {
  return React.createElement(View, {
    style: [styles.polyline, { backgroundColor: strokeColor }],
    ...props
  }, React.createElement(Text, { style: styles.polylineText }, 'Route'));
};

// Stub MapMarkerNativeComponent and related native components
const MapMarkerNativeComponent = Marker;
const Commands = {
  showCallout: () => {},
  hideCallout: () => {},
  setCoordinates: () => {},
  redrawCallout: () => {},
  animateMarkerToCoordinate: () => {},
  redraw: () => {},
};

// Stub codegenNativeCommands
const codegenNativeCommands = () => Commands;

// Constants
const PROVIDER_GOOGLE = 'google';
const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b3d9e8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  mapText: {
    fontSize: 16,
    color: '#5a7ba7',
    textAlign: 'center',
  },
  marker: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    padding: 4,
    margin: 2,
  },
  markerText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
  },
  polyline: {
    height: 2,
    margin: 2,
  },
  polylineText: {
    fontSize: 8,
    color: 'white',
  },
});

// Default export
export default MapView;

// Named exports
export { 
  MapView,
  Marker, 
  Polyline,
  MapMarkerNativeComponent,
  Commands,
  codegenNativeCommands,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT
};
