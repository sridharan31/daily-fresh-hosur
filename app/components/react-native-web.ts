// app/components/react-native-web.ts
// This file exports React Native components to work with React Native Web

import {
    ActivityIndicator as RNActivityIndicator,
    Dimensions as RNDimensions,
    Modal as RNModal,
    Platform as RNPlatform,
    ScrollView as RNScrollView,
    StyleSheet as RNStyleSheet,
    Text as RNText,
    TextInput as RNTextInput,
    TouchableOpacity as RNTouchableOpacity,
    View as RNView,
} from 'react-native';

// Re-export components
export const View = RNView;
export const Text = RNText;
export const TextInput = RNTextInput;
export const StyleSheet = RNStyleSheet;
export const TouchableOpacity = RNTouchableOpacity;
export const ScrollView = RNScrollView;
export const ActivityIndicator = RNActivityIndicator;
export const Platform = RNPlatform;
export const Modal = RNModal;
export const Dimensions = RNDimensions;

// Get screen dimensions
export const getWindowDimensions = () => RNDimensions.get('window');