import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface AllDayToggleProps {
  label?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

export const AllDayToggle: React.FC<AllDayToggleProps> = ({
  label = 'All Day',
  value,
  onToggle,
  disabled = false,
}) => {
  const theme = useTheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      opacity: disabled ? 0.6 : 1,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    toggle: {
      width: 50,
      height: 28,
      borderRadius: 14,
      padding: 2,
      justifyContent: 'center',
      backgroundColor: value ? theme.colors.primary : theme.colors.border,
      opacity: disabled ? 0.6 : 1,
    },
    toggleThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'white',
      alignSelf: value ? 'flex-end' : 'flex-start',
      ...theme.shadows.sm,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.label}>{label}</Text>
      
      <TouchableOpacity
        style={dynamicStyles.toggleContainer}
        onPress={() => !disabled && onToggle(!value)}
        disabled={disabled}
      >
        <View style={dynamicStyles.toggle}>
          <View style={dynamicStyles.toggleThumb} />
        </View>
      </TouchableOpacity>
    </View>
  );
};
