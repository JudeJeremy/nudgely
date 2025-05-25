import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  subtitle?: string;
  compact?: boolean; // New prop for compact mode
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  leftComponent,
  subtitle,
  compact = false,
}) => {
  const theme = useTheme();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      paddingTop: compact ? theme.spacing.xs : theme.spacing.md,
      paddingBottom: compact ? theme.spacing.xs : theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: compact ? 0 : 1,
      borderBottomColor: theme.colors.border,
      ...(compact ? {} : theme.shadows.sm),
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: compact ? 32 : 44,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    centerSection: {
      flex: 2,
      alignItems: 'center',
    },
    rightSection: {
      flex: 1,
      alignItems: 'flex-end',
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    titleContainer: {
      alignItems: 'center',
    },
    title: {
      fontSize: compact ? theme.typography.fontSize.md : theme.typography.fontSize.lg,
      fontWeight: compact ? '600' : 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: compact ? theme.typography.fontSize.xs : theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
      marginTop: 2,
    },
  });
  
  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.content}>
        {/* Left Section */}
        <View style={dynamicStyles.leftSection}>
          {showBackButton && onBackPress && (
            <TouchableOpacity
              style={dynamicStyles.backButton}
              onPress={onBackPress}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
          )}
          {leftComponent && !showBackButton && leftComponent}
        </View>
        
        {/* Center Section */}
        <View style={dynamicStyles.centerSection}>
          <View style={dynamicStyles.titleContainer}>
            <Text style={dynamicStyles.title}>{title}</Text>
            {subtitle && (
              <Text style={dynamicStyles.subtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        
        {/* Right Section */}
        <View style={dynamicStyles.rightSection}>
          {rightComponent}
        </View>
      </View>
    </View>
  );
};
