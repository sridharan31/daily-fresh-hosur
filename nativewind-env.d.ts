/// <reference types="nativewind/types" />

// CSS module declarations
declare module '*.css' {
  const content: any;
  export default content;
}

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
}

declare module 'expo-linear-gradient' {
  interface LinearGradientProps {
    className?: string;
  }
}