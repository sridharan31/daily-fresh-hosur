 import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  testID?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = 'outlined',
      size = 'medium',
      disabled = false,
      required = false,
      containerStyle,
      inputStyle,
      labelStyle,
      testID,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const containerStyles = [
      styles.container,
      containerStyle,
    ];

    const inputContainerStyles = [
      styles.inputContainer,
      styles[variant],
      styles[size],
      isFocused && styles.focused,
      error && styles.error,
      disabled && styles.disabled,
    ];

    const textInputStyles = [
      styles.input,
      styles[`${size}Input`],
      leftIcon && styles.inputWithLeftIcon,
      rightIcon && styles.inputWithRightIcon,
      inputStyle,
    ];

    return (
      <View style={containerStyles} testID={testID}>
        {label && (
          <Text style={[styles.label, labelStyle]}>
            {String(label)}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        )}

        <View style={inputContainerStyles}>
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={20}
              color={isFocused ? '#4CAF50' : '#666'}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            ref={ref}
            style={textInputStyles}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            editable={!disabled}
            placeholderTextColor="#999"
            testID={`${testID}-input`}
            {...textInputProps}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
              testID={`${testID}-right-icon`}
            >
              <Icon
                name={rightIcon}
                size={20}
                color={isFocused ? '#4CAF50' : '#666'}
              />
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <Text style={styles.errorText} testID={`${testID}-error`}>
            {String(error)}
          </Text>
        )}

        {hint && !error && (
          <Text style={styles.hintText} testID={`${testID}-hint`}>
            {String(hint)}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  // Variants
  default: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderRadius: 0,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filled: {
    backgroundColor: '#f5f5f5',
    borderWidth: 0,
  },
  // Sizes
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // States
  focused: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  error: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  smallInput: {
    fontSize: 14,
  },
  mediumInput: {
    fontSize: 16,
  },
  largeInput: {
    fontSize: 18,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default Input;
