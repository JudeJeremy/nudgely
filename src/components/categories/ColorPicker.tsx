import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

// Predefined color palette
const colorPalette = [
  '#4e73df', // Blue
  '#1cc88a', // Green
  '#e74a3b', // Red
  '#f6c23e', // Yellow
  '#6f42c1', // Purple
  '#fd7e14', // Orange
  '#20c997', // Teal
  '#e83e8c', // Pink
  '#6c757d', // Gray
  '#17a2b8', // Cyan
  '#28a745', // Success Green
  '#dc3545', // Danger Red
  '#ffc107', // Warning Yellow
  '#007bff', // Primary Blue
  '#6610f2', // Indigo
  '#e91e63', // Material Pink
  '#9c27b0', // Material Purple
  '#673ab7', // Deep Purple
  '#3f51b5', // Indigo
  '#2196f3', // Blue
  '#03a9f4', // Light Blue
  '#00bcd4', // Cyan
  '#009688', // Teal
  '#4caf50', // Green
  '#8bc34a', // Light Green
  '#cddc39', // Lime
  '#ffeb3b', // Yellow
  '#ffc107', // Amber
  '#ff9800', // Orange
  '#ff5722', // Deep Orange
  '#795548', // Brown
  '#607d8b', // Blue Gray
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  label = 'Color',
  disabled = false,
}) => {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setIsModalVisible(false);
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
      fontWeight: '500',
    },
    picker: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: disabled ? theme.colors.border : theme.colors.card,
      opacity: disabled ? 0.6 : 1,
    },
    pickerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    colorPreview: {
      width: 24,
      height: 24,
      borderRadius: 12,
      marginRight: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    pickerText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    chevron: {
      marginLeft: theme.spacing.sm,
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      width: Dimensions.get('window').width * 0.9,
      maxHeight: Dimensions.get('window').height * 0.7,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    colorGrid: {
      paddingBottom: theme.spacing.md,
    },
    colorRow: {
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    colorItem: {
      width: 40,
      height: 40,
      borderRadius: 20,
      margin: theme.spacing.xs,
      borderWidth: 3,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorItemSelected: {
      borderColor: theme.colors.text,
    },
    checkIcon: {
      position: 'absolute',
    },
  });
  
  const renderColorItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedColor;
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.colorItem,
          { backgroundColor: item },
          isSelected && dynamicStyles.colorItemSelected,
        ]}
        onPress={() => handleColorSelect(item)}
      >
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={20}
            color={theme.dark ? '#000' : '#fff'}
            style={dynamicStyles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.label}>{label}</Text>
      
      <TouchableOpacity
        style={dynamicStyles.picker}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
      >
        <View style={dynamicStyles.pickerContent}>
          <View style={[dynamicStyles.colorPreview, { backgroundColor: selectedColor }]} />
          <Text style={dynamicStyles.pickerText}>
            {selectedColor.toUpperCase()}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.text}
          style={dynamicStyles.chevron}
        />
      </TouchableOpacity>
      
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={dynamicStyles.modal}>
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>Select Color</Text>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={colorPalette}
              renderItem={renderColorItem}
              keyExtractor={(item) => item}
              numColumns={6}
              contentContainerStyle={dynamicStyles.colorGrid}
              columnWrapperStyle={dynamicStyles.colorRow}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
