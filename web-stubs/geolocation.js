// web-stubs/geolocation.js

const getCurrentPosition = (successCallback, errorCallback, options) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  } else {
    if (errorCallback) {
      errorCallback({
        code: 2,
        message: 'Geolocation not supported'
      });
    }
  }
};

const watchPosition = (successCallback, errorCallback, options) => {
  if (navigator.geolocation) {
    return navigator.geolocation.watchPosition(successCallback, errorCallback, options);
  }
  return -1;
};

const clearWatch = (watchId) => {
  if (navigator.geolocation && watchId >= 0) {
    navigator.geolocation.clearWatch(watchId);
  }
};

const requestAuthorization = () => {
  return Promise.resolve('granted');
};

const checkPermissions = () => {
  return Promise.resolve('granted');
};

export default {
  getCurrentPosition,
  watchPosition,
  clearWatch,
  requestAuthorization,
  checkPermissions,
};

export {
  getCurrentPosition,
  watchPosition,
  clearWatch,
  requestAuthorization,
  checkPermissions,
};
