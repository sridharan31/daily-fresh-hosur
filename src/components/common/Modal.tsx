 // app/components/common/Modal.tsx
import React, { useEffect } from 'react';
import {
    BackHandler,
    Dimensions,
    Modal as RNModal,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');

interface ModalAction {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: ModalAction[];
  variant?: 'center' | 'bottom' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnBackPress?: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  actions = [],
  variant = 'center',
  showCloseButton = true,
  closeOnBackdropPress = true,
  closeOnBackPress = true,
  animationType = 'fade',
  style,
  contentStyle,
  titleStyle,
  testID,
}) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible || !closeOnBackPress) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, closeOnBackPress, onClose]);

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const renderActions = () => {
    if (actions.length === 0) return null;

    return (
      <View style={styles.actions}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              styles[`${action.variant || 'primary'}Button`],
              action.disabled && styles.disabledButton,
            ]}
            onPress={action.onPress}
            disabled={action.disabled}
            testID={`${testID}-action-${index}`}
          >
            <Text
              style={[
                styles.actionText,
                styles[`${action.variant || 'primary'}Text`],
              ]}
            >
              {action.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getModalStyle = () => {
    switch (variant) {
      case 'bottom':
        return [
          styles.bottomModal,
          {paddingBottom: insets.bottom},
        ];
      case 'fullscreen':
        return [
          styles.fullscreenModal,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ];
      default:
        return styles.centerModal;
    }
  };

  const getContainerStyle = () => {
    switch (variant) {
      case 'bottom':
        return styles.bottomContainer;
      case 'fullscreen':
        return styles.fullscreenContainer;
      default:
        return styles.centerContainer;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={variant !== 'fullscreen'}
      animationType={animationType}
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={[styles.overlay, getContainerStyle()]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        <View style={[getModalStyle(), style]}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                {title || ''}
              </Text>
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  testID={`${testID}-close`}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Content */}
          <View style={[styles.content, contentStyle]}>
            {children}
          </View>

          {/* Actions */}
          {renderActions()}
        </View>
      </View>
    </RNModal>
  );
};

// Alert Modal Component
export const AlertModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}> = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
}) => {
  const actions: ModalAction[] = [
    ...(cancelText ? [{
      text: cancelText,
      onPress: onClose,
      variant: 'secondary' as const,
    }] : []),
    {
      text: confirmText,
      onPress: onConfirm || onClose,
      variant: 'primary' as const,
    },
  ];

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      actions={actions}
      variant="center"
    >
      <Text style={styles.message}>{message}</Text>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Container styles
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  bottomContainer: {
    justifyContent: 'flex-end',
  },
  fullscreenContainer: {
    flex: 1,
  },
  // Modal styles
  centerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: width - 40,
    maxHeight: height - 100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  bottomModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#4CAF50',
  },
  dangerText: {
    color: '#fff',
  },
  message: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default Modal;
