import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface MonthYearPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  
  const formatDisplayText = () => {
    return `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };
  
  const handleMonthYearSelect = (month: number, year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(month);
    newDate.setFullYear(year);
    onDateChange(newDate);
    setShowPicker(false);
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    triggerText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
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
      padding: theme.spacing.lg,
      width: '80%',
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    pickerContainer: {
      flexDirection: 'row',
      flex: 1,
    },
    pickerColumn: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    columnTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    scrollView: {
      maxHeight: 200,
    },
    pickerItem: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      marginVertical: 2,
      alignItems: 'center',
    },
    selectedPickerItem: {
      backgroundColor: theme.colors.primary,
    },
    pickerItemText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    selectedPickerItemText: {
      color: 'white',
      fontWeight: '600',
    },
  });
  
  return (
    <View style={dynamicStyles.container}>
      <TouchableOpacity
        style={dynamicStyles.trigger}
        onPress={() => setShowPicker(true)}
      >
        <Text style={dynamicStyles.triggerText}>
          {formatDisplayText()}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={theme.colors.text}
        />
      </TouchableOpacity>
      
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <TouchableOpacity
            style={dynamicStyles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Select Month & Year</Text>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setShowPicker(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            
            <View style={dynamicStyles.pickerContainer}>
              {/* Month Column */}
              <View style={dynamicStyles.pickerColumn}>
                <Text style={dynamicStyles.columnTitle}>Month</Text>
                <ScrollView style={dynamicStyles.scrollView}>
                  {months.map((month, index) => {
                    const isSelected = index === selectedDate.getMonth();
                    
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[
                          dynamicStyles.pickerItem,
                          isSelected && dynamicStyles.selectedPickerItem,
                        ]}
                        onPress={() => handleMonthYearSelect(index, selectedDate.getFullYear())}
                      >
                        <Text
                          style={[
                            dynamicStyles.pickerItemText,
                            isSelected && dynamicStyles.selectedPickerItemText,
                          ]}
                        >
                          {month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              
              {/* Year Column */}
              <View style={dynamicStyles.pickerColumn}>
                <Text style={dynamicStyles.columnTitle}>Year</Text>
                <ScrollView style={dynamicStyles.scrollView}>
                  {years.map((year) => {
                    const isSelected = year === selectedDate.getFullYear();
                    
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[
                          dynamicStyles.pickerItem,
                          isSelected && dynamicStyles.selectedPickerItem,
                        ]}
                        onPress={() => handleMonthYearSelect(selectedDate.getMonth(), year)}
                      >
                        <Text
                          style={[
                            dynamicStyles.pickerItemText,
                            isSelected && dynamicStyles.selectedPickerItemText,
                          ]}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
