import React, { useState } from 'react';
import { 
  View, 
  TextInput as RNTextInput, 
  Text, 
  StyleSheet, 
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onLeftIconPress,
  ...rest
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = () => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus({} as any);
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur({} as any);
    }
  };
  
  // Determine border color based on state (focused, error, or default)
  const getBorderColor = () => {
    if (error) return theme.colors_extended.danger[theme.dark ? 'dark' : 'light'];
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };
  
  const inputContainerStyles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
      ...containerStyle,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
      ...labelStyle,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: getBorderColor(),
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.card,
      ...inputStyle,
    },
    input: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.md,
    },
    iconContainer: {
      padding: theme.spacing.sm,
    },
    error: {
      color: theme.colors_extended.danger[theme.dark ? 'dark' : 'light'],
      fontSize: theme.typography.fontSize.xs,
      marginTop: theme.spacing.xs,
      ...errorStyle,
    },
  });
  
  return (
    <View style={inputContainerStyles.container}>
      {label && <Text style={inputContainerStyles.label}>{label}</Text>}
      
      <View style={inputContainerStyles.inputContainer}>
        {leftIcon && (
          <TouchableOpacity 
            style={inputContainerStyles.iconContainer} 
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
          >
            {leftIcon}
          </TouchableOpacity>
        )}
        
        <RNTextInput
          style={inputContainerStyles.input}
          placeholderTextColor={theme.dark ? '#666' : '#999'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={inputContainerStyles.iconContainer} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={inputContainerStyles.error}>{error}</Text>}
    </View>
  );
};
