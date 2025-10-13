import { Alert } from 'react-native';

// Platform detection
const isWeb = typeof window !== 'undefined' && window.document;

// Image configuration constants
export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  THUMBNAIL_SIZE: 200,
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  PLACEHOLDER_COLOR: '#f0f0f0',
} as const;

// Image source types
export interface ImageSource {
  uri: string;
  width?: number;
  height?: number;
  type?: string;
  size?: number;
}

// Image picker result
export interface ImagePickerResult {
  success: boolean;
  image?: ImageSource;
  error?: string;
  cancelled?: boolean;
}

class ImageUtils {
  // Show image picker (web-safe)
  showImagePicker(): Promise<ImagePickerResult> {
    if (isWeb) {
      return Promise.resolve({
        success: false,
        error: 'Image picker not available on web platform',
      });
    }
    
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve({ success: false, cancelled: true }) },
        ]
      );
    });
  }
}

// Export singleton instance
export const imageUtils = new ImageUtils();
export default imageUtils;
