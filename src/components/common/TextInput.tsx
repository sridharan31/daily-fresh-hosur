import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, StyleSheet, Text, TextInputProps, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  errorStyle?: any;
  // Explicitly add these props to fix type errors
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad' | 'decimal-pad' | 'visible-password' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'name-phone-pad' | 'twitter' | 'web-search';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const TextInput = forwardRef<RNTextInput, CustomTextInputProps>(
  ({ label, error, touched, containerStyle, inputStyle, labelStyle, errorStyle, ...props }, ref) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    
    const showError = !!error && touched;
    
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        <RNTextInput
          ref={ref}
          style={[
            styles.input,
            showError && styles.inputError,
            inputStyle
          ]}
          placeholderTextColor={colors.placeholder}
          {...props}
        />
        {showError && (
          <Text style={[styles.errorText, errorStyle]}>{error}</Text>
        )}
      </View>
    );
  }
);

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default TextInput;