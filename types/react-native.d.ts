// Override React Native typings for web compatibility
import 'react-native';

declare module 'react-native' {
  export const StyleSheet: any;
  export const Text: any;
  export const TouchableOpacity: any;
  export const View: any;
  export const Image: any;
  export const ScrollView: any;
  export const FlatList: any;
  export const SafeAreaView: any;
  export const Alert: any;
  export const ActivityIndicator: any;
  export const Dimensions: any;
  export const KeyboardAvoidingView: any;
  export const Platform: any;
  export const TextInput: any;
  export const Animated: any;
}