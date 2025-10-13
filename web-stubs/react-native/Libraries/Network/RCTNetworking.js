/**
 * Web-compatible RCTNetworking for React Native
 */

const RCTNetworking = {
  sendRequest: (method, trackingName, url, headers, data, responseType, incrementalUpdates, timeout, callback, withCredentials) => {
    // Use fetch API for web
    const fetchOptions = {
      method,
      headers: headers || {},
      credentials: withCredentials ? 'include' : 'same-origin',
    };

    if (data && method !== 'GET') {
      if (typeof data === 'string') {
        fetchOptions.body = data;
      } else {
        fetchOptions.body = JSON.stringify(data);
        fetchOptions.headers['Content-Type'] = 'application/json';
      }
    }

    const controller = new AbortController();
    if (timeout) {
      setTimeout(() => controller.abort(), timeout);
    }
    fetchOptions.signal = controller.signal;

    fetch(url, fetchOptions)
      .then(response => {
        const headers = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        
        return response.text().then(text => {
          callback(null, {
            status: response.status,
            statusText: response.statusText,
            headers,
            body: text,
          });
        });
      })
      .catch(error => {
        callback(error.message, null);
      });
  },
  
  abortRequest: (requestId) => {
    // Abort is handled by AbortController above
  },
};

module.exports = RCTNetworking;