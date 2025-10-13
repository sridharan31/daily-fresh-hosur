/**
 * Polyfill for window.matchMedia
 * Provides matchMedia API for environments that don't have it
 */

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function(query) {
    // Simple implementation that always returns a media query list
    return {
      matches: false, // Default to false for most cases
      media: query,
      onchange: null,
      addListener: function(listener) {
        // No-op for web stub
      },
      removeListener: function(listener) {
        // No-op for web stub
      },
      addEventListener: function(type, listener) {
        // No-op for web stub
      },
      removeEventListener: function(type, listener) {
        // No-op for web stub
      },
      dispatchEvent: function(event) {
        // No-op for web stub
      }
    };
  };
}

// Also polyfill for MediaQueryList if needed
if (typeof window !== 'undefined' && !window.MediaQueryList) {
  window.MediaQueryList = function(query) {
    this.matches = false;
    this.media = query;
  };
}