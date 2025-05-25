import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type ViewMode = 'daily' | 'monthly' | 'yearly';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  const theme = useTheme();
  
  const viewOptions: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'daily', label: 'Daily', icon: 'today' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar' },
    { key: 'yearly', label: 'Yearly', icon: 'calendar-outline' },
  ];
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
    },
    activeOption: {
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
      fontWeight: '500',
    },
    activeOptionText: {
      color: 'white',
    },
  });
  
  return (
    <View style={dynamicStyles.container}>
      {viewOptions.map((option) => {
        const isActive = currentView === option.key;
        
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              dynamicStyles.option,
              isActive && dynamicStyles.activeOption,
            ]}
            onPress={() => onViewChange(option.key)}
          >
            <Ionicons
              name={option.icon as any}
              size={14}
              color={isActive ? 'white' : theme.colors.text}
            />
            <Text
              style={[
                dynamicStyles.optionText,
                isActive && dynamicStyles.activeOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
