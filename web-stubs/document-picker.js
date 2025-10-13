// web-stubs/document-picker.js

const pick = (options = {}) => {
  console.log('Document picker (web):', options);
  
  return new Promise((resolve, reject) => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = options.allowMultiSelection || false;
    
    if (options.type) {
      // Map document picker types to file input accept
      const typeMap = {
        'images': 'image/*',
        'pdf': 'application/pdf',
        'plainText': 'text/plain',
        'audio': 'audio/*',
        'video': 'video/*',
      };
      input.accept = typeMap[options.type] || '*/*';
    }
    
    input.onchange = (event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) {
        reject(new Error('User cancelled'));
        return;
      }
      
      const results = files.map(file => ({
        uri: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      
      resolve(options.allowMultiSelection ? results : results[0]);
    };
    
    input.click();
  });
};

const pickSingle = (options = {}) => {
  return pick({ ...options, allowMultiSelection: false });
};

const pickMultiple = (options = {}) => {
  return pick({ ...options, allowMultiSelection: true });
};

export default {
  pick,
  pickSingle,
  pickMultiple,
};

export {
  pick,
  pickSingle,
  pickMultiple,
};
