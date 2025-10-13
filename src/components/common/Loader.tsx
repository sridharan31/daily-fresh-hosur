 // app/components/common/Loader.tsx
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';

interface LoaderProps {
  visible?: boolean;
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  transparent?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

const Loader: React.FC<LoaderProps> = ({
  visible = true,
  size = 'large',
  color = '#4CAF50',
  text,
  overlay = false,
  transparent = false,
  style,
  textStyle,
  testID,
}) => {
  if (!visible) {
    return null;
  }

  const loaderContent = (
    <View style={[styles.container, style]} testID={testID}>
      <View style={[
        styles.content,
        transparent && styles.transparentContent,
      ]}>
        <ActivityIndicator size={size} color={color} />
        {text && (
          <Text style={[styles.text, textStyle, {color}]} testID={`${testID}-text`}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        testID={`${testID}-modal`}
      >
        <View style={styles.overlay}>
          {loaderContent}
        </View>
      </Modal>
    );
  }

  return loaderContent;
};

// Alternative inline loader component
export const InlineLoader: React.FC<Omit<LoaderProps, 'overlay'>> = (props) => (
  <Loader {...props} overlay={false} />
);

// Full screen overlay loader
export const OverlayLoader: React.FC<LoaderProps> = (props) => (
  <Loader {...props} overlay={true} />
);

// Small button loader
export const ButtonLoader: React.FC<{
  visible?: boolean;
  color?: string;
}> = ({visible = true, color = '#fff'}) => {
  if (!visible) return null;
  return <ActivityIndicator size="small" color={color} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  transparentContent: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Loader;

