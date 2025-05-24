import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  TouchableOpacity, 
  TouchableOpacityProps 
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  onPress?: () => void;
  color?: string;
  borderRadius?: number;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'small',
  onPress,
  color,
  borderRadius,
  padding,
  ...rest
}) => {
  const theme = useTheme();
  
  // Get shadow based on elevation
  const getShadow = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'medium':
        return theme.shadows.md;
      case 'large':
        return theme.shadows.lg;
      default:
        return theme.shadows.sm;
    }
  };
  
  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: color || theme.colors.card,
      borderRadius: borderRadius !== undefined ? borderRadius : theme.borderRadius.md,
      padding: padding !== undefined ? padding : theme.spacing.md,
      ...getShadow(),
      ...style,
    }
  }).card;
  
  // If onPress is provided, wrap in TouchableOpacity, otherwise use View
  if (onPress) {
    return (
      <TouchableOpacity 
        style={cardStyles} 
        onPress={onPress} 
        activeOpacity={0.7}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return <View style={cardStyles}>{children}</View>;
};
