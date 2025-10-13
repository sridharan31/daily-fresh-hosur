/**
 * Web-compatible BaseViewConfig for React Native
 */

const BaseViewConfig = {
  uiViewClassName: 'RCTView',
  bubblingEventTypes: {
    topBlur: {
      phasedRegistrationNames: {
        bubbled: 'onBlur',
        captured: 'onBlurCapture',
      },
    },
    topFocus: {
      phasedRegistrationNames: {
        bubbled: 'onFocus',
        captured: 'onFocusCapture', 
      },
    },
    topTouchEnd: {
      phasedRegistrationNames: {
        bubbled: 'onTouchEnd',
        captured: 'onTouchEndCapture',
      },
    },
    topTouchStart: {
      phasedRegistrationNames: {
        bubbled: 'onTouchStart',
        captured: 'onTouchStartCapture',
      },
    },
  },
  directEventTypes: {},
  validAttributes: {
    accessible: true,
    accessibilityRole: true,
    accessibilityState: true,
    accessibilityLabel: true,
    accessibilityHint: true,
    testID: true,
    nativeID: true,
    style: true,
  },
};

module.exports = BaseViewConfig;