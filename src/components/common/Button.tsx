import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  ...rest
}) => {
  const theme = useTheme();
  
  // Determine background color based on variant
  const getBackgroundColor = () => {
    if (variant === 'outline') return 'transparent';
    
    if (variant === 'primary') {
      return theme.colors.primary;
    } else if (variant === 'secondary') {
      return theme.colors_extended.secondary[theme.dark ? 'dark' : 'light'];
    } else if (variant === 'success') {
      return theme.colors_extended.success[theme.dark ? 'dark' : 'light'];
    } else if (variant === 'danger') {
      return theme.colors_extended.danger[theme.dark ? 'dark' : 'light'];
    } else if (variant === 'warning') {
      return theme.colors_extended.warning[theme.dark ? 'dark' : 'light'];
    } else if (variant === 'info') {
      return theme.colors_extended.info[theme.dark ? 'dark' : 'light'];
    }
    
    return theme.colors.primary;
  };
  
  // Determine text color based on variant
  const getTextColor = () => {
    if (variant === 'outline') {
      return theme.colors.primary;
    }
    
    return variant === 'primary' || variant === 'danger' ? '#ffffff' : theme.colors.text;
  };
  
  // Determine border color for outline variant
  const getBorderColor = () => {
    if (variant !== 'outline') return 'transparent';
    return theme.colors.primary;
  };
  
  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return theme.spacing.xs;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };
  
  // Determine font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.fontSize.sm;
      case 'large':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.md;
    }
  };
  
  const buttonStyles = StyleSheet.create({
    dynamicButton: {
      ...styles.button,
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === 'outline' ? 1 : 0,
      padding: getPadding(),
      opacity: disabled ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
      ...theme.shadows.sm,
    }
  }).dynamicButton;
  
  const textStyles = [
    styles.text,
    {
      color: getTextColor(),
      fontSize: getFontSize(),
      marginLeft: icon && iconPosition === 'left' ? theme.spacing.sm : 0,
      marginRight: icon && iconPosition === 'right' ? theme.spacing.sm : 0,
    },
    textStyle,
  ];
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  text: {
    fontWeight: '600',
  },
});
