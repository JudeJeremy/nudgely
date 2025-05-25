import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../store';
import { Category } from '../../store/slices/categorySlice';

interface CategoryPickerProps {
  selectedCategoryId?: string;
  onCategorySelect: (categoryId: string) => void;
  type: 'task' | 'habit' | 'both';
  placeholder?: string;
  disabled?: boolean;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategoryId,
  onCategorySelect,
  type,
  placeholder = 'Select Category',
  disabled = false,
}) => {
  const theme = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const categories = useAppSelector((state) => 
    state.categories.categories.filter(
      (category) => category.type === type || category.type === 'both'
    )
  );
  
  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  
  const handleCategorySelect = (category: Category) => {
    onCategorySelect(category.id);
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
    categoryIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },
    categoryColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: theme.spacing.sm,
    },
    pickerText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      flex: 1,
    },
    placeholderText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.dark ? '#666' : '#999',
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
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    categoryItemSelected: {
      backgroundColor: theme.colors.primary + '20',
    },
    categoryItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryItemText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    categoryItemDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.7,
      marginLeft: theme.spacing.sm,
      marginTop: 2,
    },
    checkIcon: {
      marginLeft: theme.spacing.sm,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
    },
  });
  
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = item.id === selectedCategoryId;
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.categoryItem,
          isSelected && dynamicStyles.categoryItemSelected,
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <View style={dynamicStyles.categoryItemContent}>
          <View style={[dynamicStyles.categoryColor, { backgroundColor: item.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.categoryItemText}>{item.name}</Text>
            {item.description && (
              <Text style={dynamicStyles.categoryItemDescription}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={20}
            color={theme.colors.primary}
            style={dynamicStyles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.label}>Category</Text>
      
      <TouchableOpacity
        style={dynamicStyles.picker}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
      >
        <View style={dynamicStyles.pickerContent}>
          {selectedCategory ? (
            <>
              <View style={[dynamicStyles.categoryColor, { backgroundColor: selectedCategory.color }]} />
              <Text style={dynamicStyles.pickerText}>{selectedCategory.name}</Text>
            </>
          ) : (
            <Text style={dynamicStyles.placeholderText}>{placeholder}</Text>
          )}
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
              <Text style={dynamicStyles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {categories.length > 0 ? (
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={dynamicStyles.emptyState}>
                <Text style={dynamicStyles.emptyStateText}>
                  No categories available for {type}s.{'\n'}
                  Create some categories in Settings.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
