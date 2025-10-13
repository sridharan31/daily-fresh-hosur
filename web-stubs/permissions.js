// web-stubs/permissions.js

const PERMISSIONS = {
  ANDROID: {
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
    CAMERA: 'android.permission.CAMERA',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
    WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
  },
  IOS: {
    LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    CAMERA: 'ios.permission.CAMERA',
    PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
  },
};

const RESULTS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
};

const check = (permission) => {
  console.log('Permission check (web):', permission);
  // Most web permissions are handled by browser
  return Promise.resolve(RESULTS.GRANTED);
};

const request = (permission) => {
  console.log('Permission request (web):', permission);
  // Most web permissions are handled by browser
  return Promise.resolve(RESULTS.GRANTED);
};

const checkMultiple = (permissions) => {
  console.log('Multiple permissions check (web):', permissions);
  const result = {};
  permissions.forEach(permission => {
    result[permission] = RESULTS.GRANTED;
  });
  return Promise.resolve(result);
};

const requestMultiple = (permissions) => {
  console.log('Multiple permissions request (web):', permissions);
  const result = {};
  permissions.forEach(permission => {
    result[permission] = RESULTS.GRANTED;
  });
  return Promise.resolve(result);
};

export default {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  checkMultiple,
  requestMultiple,
};

export {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  checkMultiple,
  requestMultiple,
};
