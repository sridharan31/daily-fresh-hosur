import 'react-native';

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
  
  interface ImageProps {
    className?: string;
  }
  
  interface TextInputProps {
    className?: string;
  }
  
  interface FlatListProps<ItemT> {
    className?: string;
  }
  
  interface SafeAreaViewProps {
    className?: string;
  }
  
  interface TouchableHighlightProps {
    className?: string;
  }
  
  interface PressableProps {
    className?: string;
  }
}