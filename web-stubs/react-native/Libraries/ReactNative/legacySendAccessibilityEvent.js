/**
 * Web-compatible legacySendAccessibilityEvent for React Native
 */

const legacySendAccessibilityEvent = (reactTag, eventType, eventData) => {
  // Web implementation - dispatch custom event for accessibility
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('accessibilityEvent', {
      detail: { reactTag, eventType, eventData }
    });
    window.dispatchEvent(event);
  }
};

module.exports = legacySendAccessibilityEvent;