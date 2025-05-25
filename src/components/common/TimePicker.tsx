import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';

interface TimePickerProps {
  label: string;
  value?: string; // Time in HH:MM format
  onTimeChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onTimeChange,
  placeholder = 'Select time',
  disabled = false,
}) => {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  // Convert time string to Date object
  const timeStringToDate = (timeString?: string): Date => {
    if (!timeString) return new Date();
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  // Convert Date object to time string
  const dateToTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle time picker change
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedTime) {
        onTimeChange(dateToTimeString(selectedTime));
      }
      return;
    }

    // iOS handling
    if (selectedTime) {
      setTempTime(selectedTime);
    }
  };

  // Handle picker button press
  const handlePickerPress = () => {
    if (disabled) return;
    
    setTempTime(timeStringToDate(value));
    setShowPicker(true);
  };

  // Handle iOS picker done
  const handlePickerDone = () => {
    if (tempTime) {
      onTimeChange(dateToTimeString(tempTime));
    }
    setShowPicker(false);
    setTempTime(null);
  };

  // Handle iOS picker cancel
  const handlePickerCancel = () => {
    setShowPicker(false);
    setTempTime(null);
  };

  // Handle clear time
  const handleClearTime = () => {
    onTimeChange('');
  };

  // Format time for display
  const formatTimeForDisplay = (timeString?: string): string => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    pickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: disabled ? theme.colors.background : theme.colors.card,
      opacity: disabled ? 0.6 : 1,
    },
    pickerText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    placeholderText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      opacity: 0.5,
    },
    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    clearButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.xs,
    },
    clearButtonText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSize.sm,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      margin: theme.spacing.lg,
      minWidth: 300,
      ...theme.shadows.lg,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.label}>{label}</Text>
      
      <TouchableOpacity
        style={dynamicStyles.pickerButton}
        onPress={handlePickerPress}
        disabled={disabled}
      >
        <Text style={value ? dynamicStyles.pickerText : dynamicStyles.placeholderText}>
          {value ? formatTimeForDisplay(value) : placeholder}
        </Text>
        
        <View style={dynamicStyles.rightSection}>
          {value && !disabled && (
            <TouchableOpacity
              style={dynamicStyles.clearButton}
              onPress={handleClearTime}
            >
              <Text style={dynamicStyles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={theme.colors.text} 
            style={{ opacity: 0.6 }}
          />
        </View>
      </TouchableOpacity>

      {/* Time Picker Modal */}
      {showPicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={handlePickerCancel}
        >
          <View style={dynamicStyles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <Text style={dynamicStyles.modalTitle}>Select Time</Text>
              
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={tempTime || timeStringToDate(value)}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  style={{ height: 200 }}
                />
              ) : (
                <DateTimePicker
                  value={tempTime || timeStringToDate(value)}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
              
              <View style={dynamicStyles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={handlePickerCancel}
                  variant="outline"
                />
                <Button
                  title="Done"
                  onPress={handlePickerDone}
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};
