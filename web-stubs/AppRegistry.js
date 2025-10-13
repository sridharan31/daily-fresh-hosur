/**
 * Web stub for React Native AppRegistry
 * Handles app registration for web platform (both static and client-side rendering)
 */

// In-memory registry for server-side rendering
const serverRegistry = {};

// Mock AppRegistry for web
export const AppRegistry = {
  registerComponent: (appKey, componentProvider) => {
    // Store in server registry for static rendering
    serverRegistry[appKey] = componentProvider;
    
    // Also store in window for client-side if available
    if (typeof window !== 'undefined') {
      window.__APP_REGISTRY__ = window.__APP_REGISTRY__ || {};
      window.__APP_REGISTRY__[appKey] = componentProvider;
    }
  },
  
  runApplication: (appKey, appParameters) => {
    if (typeof window !== 'undefined') {
      try {
        const React = require('react');
        const ReactDOM = require('react-dom/client');
        
        const registry = window.__APP_REGISTRY__ || serverRegistry;
        if (registry[appKey]) {
          const AppComponent = registry[appKey]();
          const rootElement = appParameters?.rootTag || document.getElementById('root');
          
          if (rootElement) {
            const root = ReactDOM.createRoot(rootElement);
            root.render(React.createElement(AppComponent));
          }
        }
      } catch (error) {
        console.warn('AppRegistry.runApplication failed on web:', error);
      }
    }
  },
  
  getAppKeys: () => {
    if (typeof window !== 'undefined' && window.__APP_REGISTRY__) {
      return Object.keys(window.__APP_REGISTRY__);
    }
    return Object.keys(serverRegistry);
  },
  
  getApplication: (appKey) => {
    // Check both client and server registries
    const registry = (typeof window !== 'undefined' && window.__APP_REGISTRY__) 
      ? window.__APP_REGISTRY__ 
      : serverRegistry;
    
    const componentProvider = registry[appKey];
    
    if (componentProvider) {
      try {
        const React = require('react');
        const Component = componentProvider();
        
        // Return the structure expo-router expects with element property
        return {
          element: React.createElement(Component),
          getStyleElement: () => null,
        };
      } catch (error) {
        console.warn('Failed to create element for', appKey, error);
      }
    }
    
    // CRITICAL: Always return an object with element property
    // Even if null, to prevent destructuring errors
    return {
      element: null,
      getStyleElement: () => null,
    };
  },
  
  unmountApplicationComponentAtRootTag: () => {
    // No-op for web
  },
  
  setWrapperComponentProvider: () => {
    // No-op for web
  },
};

// Default export
export default AppRegistry;