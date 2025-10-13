/**
 * Web-compatible Image component for React Native
 */
const React = require('react');

const Image = React.forwardRef((props, ref) => {
  const {
    source,
    style,
    resizeMode = 'cover',
    onLoad,
    onError,
    onLoadEnd,
    onLoadStart,
    testID,
    accessibilityLabel,
    ...otherProps
  } = props;

  const handleLoad = (event) => {
    if (onLoadStart) onLoadStart();
    if (onLoad) onLoad(event);
    if (onLoadEnd) onLoadEnd();
  };

  const handleError = (event) => {
    if (onError) onError(event);
    if (onLoadEnd) onLoadEnd();
  };

  const imgStyle = {
    objectFit: resizeMode,
    ...style,
  };

  const src = typeof source === 'object' && source.uri ? source.uri : source;

  return React.createElement('img', {
    ref,
    src,
    style: imgStyle,
    onLoad: handleLoad,
    onError: handleError,
    'data-testid': testID,
    alt: accessibilityLabel || '',
    ...otherProps,
  });
});

// Static methods
Image.getSize = (uri, success, failure) => {
  const img = new window.Image();
  img.onload = () => success(img.naturalWidth, img.naturalHeight);
  img.onerror = failure;
  img.src = uri;
};

Image.getSizeWithHeaders = (uri, headers, success, failure) => {
  // For web, headers are not supported in img tags
  Image.getSize(uri, success, failure);
};

Image.prefetch = (url) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = reject;
    img.src = url;
  });
};

Image.resolveAssetSource = (source) => {
  if (typeof source === 'object' && source.uri) {
    return source;
  }
  return { uri: source };
};

module.exports = Image;