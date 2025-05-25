import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

export type ViewMode = 'daily' | 'monthly' | 'yearly';

interface ExpandableViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ExpandableViewSwitcher: React.FC<ExpandableViewSwitcherProps> = ({
  currentView,
  onViewChange,
}) => {
  const theme = useTheme();
  const [showOptions, setShowOptions] = useState(false);
  
  const viewOptions: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'daily', label: 'Daily', icon: 'today' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar' },
    { key: 'yearly', label: 'Yearly', icon: 'calendar-outline' },
  ];
  
  const currentOption = viewOptions.find(option => option.key === currentView);
  
  const handleViewSelect = (view: ViewMode) => {
    onViewChange(view);
    setShowOptions(false);
  };
  
  const dynamicStyles = StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    triggerText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: theme.spacing.xs,
      marginRight: theme.spacing.xs,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      width: '60%',
      maxWidth: 200,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginVertical: 2,
    },
    activeOption: {
      backgroundColor: theme.colors.primary,
    },
    optionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      fontWeight: '500',
    },
    activeOptionText: {
      color: 'white',
    },
  });
  
  return (
    <>
      <TouchableOpacity
        style={dynamicStyles.trigger}
        onPress={() => setShowOptions(true)}
      >
        <Ionicons
          name={currentOption?.icon as any}
          size={16}
          color={theme.colors.text}
        />
        <Text style={dynamicStyles.triggerText}>
          {currentOption?.label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color={theme.colors.text}
        />
      </TouchableOpacity>
      
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <TouchableOpacity
            style={dynamicStyles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>View Mode</Text>
            </View>
            
            {viewOptions.map((option) => {
              const isActive = currentView === option.key;
              
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    dynamicStyles.option,
                    isActive && dynamicStyles.activeOption,
                  ]}
                  onPress={() => handleViewSelect(option.key)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={18}
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
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
