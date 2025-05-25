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
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    triggerText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: 4,
    },
    pickerContainer: {
      flexDirection: 'row',
      minHeight: 300,
    },
    pickerColumn: {
      flex: 1,
      marginHorizontal: 8,
    },
    columnTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    scrollView: {
      flex: 1,
    },
    pickerItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginVertical: 2,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectedPickerItem: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    pickerItemText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    selectedPickerItemText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.triggerText}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month & Year</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPicker(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerContainer}>
              {/* Month Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.columnTitle}>Month</Text>
                <ScrollView 
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {months.map((month, index) => {
                    const isSelected = index === selectedDate.getMonth();
                    
                    return (
                      <TouchableOpacity
                        key={`month-${index}`}
                        style={[
                          styles.pickerItem,
                          isSelected && styles.selectedPickerItem,
                        ]}
                        onPress={() => handleMonthYearSelect(index, selectedDate.getFullYear())}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            isSelected && styles.selectedPickerItemText,
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
              <View style={styles.pickerColumn}>
                <Text style={styles.columnTitle}>Year</Text>
                <ScrollView 
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                >
                  {years.map((year) => {
                    const isSelected = year === selectedDate.getFullYear();
                    
                    return (
                      <TouchableOpacity
                        key={`year-${year}`}
                        style={[
                          styles.pickerItem,
                          isSelected && styles.selectedPickerItem,
                        ]}
                        onPress={() => handleMonthYearSelect(selectedDate.getMonth(), year)}
                      >
                        <Text
                          style={[
                            styles.pickerItemText,
                            isSelected && styles.selectedPickerItemText,
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
          </View>
        </View>
      </Modal>
    </View>
  );
};
