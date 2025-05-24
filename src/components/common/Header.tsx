import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  leftComponent,
  subtitle,
}) => {
  const theme = useTheme();
  
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      paddingTop: StatusBar.currentHeight || 44, // Account for status bar
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 44,
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
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
      marginTop: 2,
    },
    appBrand: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    brandIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      marginRight: theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    brandText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: theme.colors.primary,
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
          {!showBackButton && !leftComponent && (
            <View style={dynamicStyles.appBrand}>
              <View style={dynamicStyles.brandIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="white"
                />
              </View>
              <Text style={dynamicStyles.brandText}>Nudgely</Text>
            </View>
          )}
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
