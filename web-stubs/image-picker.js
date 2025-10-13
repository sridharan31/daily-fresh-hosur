// web-stubs/image-picker.js

const launchCamera = (options = {}, callback) => {
  console.log('Camera launch (web):', options);
  
  const result = {
    didCancel: true,
    errorMessage: 'Camera not available in web environment',
  };
  
  if (callback) {
    callback(result);
  } else {
    return Promise.resolve(result);
  }
};

const launchImageLibrary = (options = {}, callback) => {
  console.log('Image library (web):', options);
  
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = options.selectionLimit > 1;
  input.accept = 'image/*';
  
  input.onchange = (e) => {
    const files = Array.from(e.target.files || []);
    const assets = files.map(file => ({
      uri: URL.createObjectURL(file),
      type: file.type,
      fileName: file.name,
      fileSize: file.size,
    }));
    
    const result = {
      assets,
      didCancel: false,
    };
    
    if (callback) {
      callback(result);
    }
  };
  
  input.click();
  return new Promise((resolve, reject) => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = options.selectionLimit > 1;
    
    input.onchange = (event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) {
        const result = { didCancel: true };
        if (callback) callback(result);
        else resolve(result);
        return;
      }
      
      const assets = files.map(file => ({
        uri: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        type: file.type,
        width: 0,
        height: 0,
      }));
      
      const result = { assets, didCancel: false };
      if (callback) callback(result);
      else resolve(result);
    };
    
    input.click();
  });
};

const showImagePicker = (options = {}, callback) => {
  return launchImageLibrary(options, callback);
};

export default {
  launchCamera,
  launchImageLibrary,
  showImagePicker,
};

export {
    launchCamera,
    launchImageLibrary,
    showImagePicker
};

