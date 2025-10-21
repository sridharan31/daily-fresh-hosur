// src/components/ui/WebCompatibleComponents.tsx
/**
 * This file exports React Native components that work in both native and web environments
 * Use these components in your app to ensure web compatibility
 */


// Create a custom Platform implementation
export const Platform = {
  OS: typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent) ? 'android' : 
       typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'web',
  select: (obj) => obj[Platform.OS] || obj.default || obj.web || {},
  Version: typeof navigator !== 'undefined' ? navigator.appVersion : '0',
};

// Import from react-native directly - webpack will alias to react-native-web
import {
  ActivityIndicator as RNActivityIndicator,
  Alert as RNAlert,
  FlatList as RNFlatList,
  Image as RNImage,
  Modal as RNModal,
  Pressable as RNPressable,
  RefreshControl as RNRefreshControl,
  SafeAreaView as RNSafeAreaView,
  ScrollView as RNScrollView,
  StatusBar as RNStatusBar,
  StyleSheet as RNStyleSheet,
  Switch as RNSwitch,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
} from 'react-native';

// Re-export these components 
export const View = RNView;
export const Text = RNText;
export const TouchableOpacity = RNTouchableOpacity;
export const ScrollView = RNScrollView;
export const FlatList = RNFlatList;
export const TextInput = RNTextInput;
export const Image = RNImage;
export const ActivityIndicator = RNActivityIndicator;
export const StyleSheet = RNStyleSheet;
export const RefreshControl = RNRefreshControl;
export const SafeAreaView = RNSafeAreaView;
export const StatusBar = RNStatusBar;
export const Modal = RNModal;
export const Switch = RNSwitch;
export const Pressable = RNPressable;

// Alert requires special handling for web
export const Alert = {
  alert: (...args) => {
    if (Platform.OS === 'web') {
      // Use browser's alert for web
      if (args.length === 1) {
        window.alert(args[0]);
      } else if (args.length === 2) {
        window.alert(`${args[0]}\n\n${args[1]}`);
      } else if (args.length >= 3 && Array.isArray(args[2])) {
        // Try to simulate RN Alert behavior with browser confirm
        const title = args[0];
        const message = args[1];
        const buttons = args[2];
        
        if (buttons.length === 1) {
          window.alert(`${title}\n\n${message}`);
          if (buttons[0].onPress) buttons[0].onPress();
        } 
        else if (buttons.length === 2) {
          const confirmResult = window.confirm(`${title}\n\n${message}`);
          
          // Find cancel and confirm buttons
          const cancelButton = buttons.find(btn => btn.style === 'cancel');
          const confirmButton = buttons.find(btn => btn.style !== 'cancel');
          
          if (confirmResult && confirmButton?.onPress) {
            confirmButton.onPress();
          } else if (!confirmResult && cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      }
    } else {
      // Use React Native's Alert for native platforms
      RNAlert.alert(...args);
    }
  },
  Alert: (...args) => {
    if (Platform.OS === 'web') {
      // Use browser's alert for web
      if (args.length === 1) {
        window.alert(args[0]);
      } else if (args.length === 2) {
        window.alert(`${args[0]}\n\n${args[1]}`);
      } else if (args.length >= 3 && Array.isArray(args[2])) {
        // Try to simulate RN Alert behavior with browser confirm
        const title = args[0];
        const message = args[1];
        const buttons = args[2];
        
        if (buttons.length === 1) {
          window.alert(`${title}\n\n${message}`);
          if (buttons[0].onPress) buttons[0].onPress();
        } 
        else if (buttons.length === 2) {
          const confirmResult = window.confirm(`${title}\n\n${message}`);
          
          // Find cancel and confirm buttons
          const cancelButton = buttons.find(btn => btn.style === 'cancel');
          const confirmButton = buttons.find(btn => btn.style !== 'cancel');
          
          if (confirmResult && confirmButton?.onPress) {
            confirmButton.onPress();
          } else if (!confirmResult && cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      }
    } else {
      // Use React Native's Alert for native platforms
      RNAlert.alert(...args);
    }
  }
};