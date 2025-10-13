/**
 * Web-compatible Platform module for React Native
 */

const Platform = {
  OS: 'web',
  select: (spec) => {
    if (spec.web !== undefined) return spec.web;
    if (spec.default !== undefined) return spec.default;
    return spec.ios || spec.android || spec.native;
  },
  isTV: false,
  isTVOS: false,
  isVision: false,
  constants: {
    osVersion: navigator.userAgent,
    deviceModel: 'Web',
    brand: 'generic',
    manufacturer: 'unknown',
  },
  Version: 1,
};

module.exports = Platform;