import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import { addCategory, updateCategory } from '../../store/slices/categorySlice';
import { Card } from '../common/Card';
import { Header } from '../common/Header';
import { Button } from '../common/Button';
import { TextInput } from '../common/TextInput';
import { ColorPicker } from './ColorPicker';
import { Category } from '../../store/slices/categorySlice';

interface CategoryFormProps {
  categoryId?: string;
  initialType?: 'task' | 'habit' | 'both';
  onSave?: (category: Category) => void;
  onCancel?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  categoryId,
  initialType = 'task',
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const existingCategory = useAppSelector((state) => 
    state.categories.categories.find((cat) => cat.id === categoryId)
  );
  
  const isEditing = !!categoryId && !!existingCategory;
  
  const [formData, setFormData] = useState({
    name: existingCategory?.name || '',
    description: existingCategory?.description || '',
    color: existingCategory?.color || '#4e73df',
    type: existingCategory?.type || initialType,
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    if (existingCategory) {
      setFormData({
        name: existingCategory.name,
        description: existingCategory.description || '',
        color: existingCategory.color,
        type: existingCategory.type,
      });
    }
  }, [existingCategory]);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 30) {
      newErrors.name = 'Category name must be less than 30 characters';
    }
    
    if (formData.description && formData.description.length > 100) {
      newErrors.description = 'Description must be less than 100 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      type: formData.type as 'task' | 'habit' | 'both',
      isDefault: false,
    };
    
    if (isEditing && existingCategory) {
      // Don't allow changing type of default categories
      if (existingCategory.isDefault && categoryData.type !== existingCategory.type) {
        Alert.alert(
          'Cannot Change Type',
          'The type of default categories cannot be changed.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      dispatch(updateCategory({
        id: categoryId!,
        ...categoryData,
      }));
      
      Alert.alert(
        'Category Updated',
        `"${categoryData.name}" has been updated successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSave) {
                onSave({ ...existingCategory, ...categoryData });
              } else {
                navigation.goBack();
              }
            },
          },
        ]
      );
    } else {
      dispatch(addCategory(categoryData));
      
      Alert.alert(
        'Category Created',
        `"${categoryData.name}" has been created successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSave) {
                const newCategory: Category = {
                  ...categoryData,
                  id: `custom-${Date.now()}`,
                  createdAt: new Date().toISOString(),
                  usageCount: 0,
                };
                onSave(newCategory);
              } else {
                navigation.goBack();
              }
            },
          },
        ]
      );
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigation.goBack();
    }
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    typeContainer: {
      marginBottom: theme.spacing.md,
    },
    typeLabel: {
      fontSize: theme.typography.fontSize.sm,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
      fontWeight: '500',
    },
    typeButtons: {
      flexDirection: 'row',
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.card,
      padding: theme.spacing.xs,
    },
    typeButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    typeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    typeButtonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      fontWeight: '500',
    },
    typeButtonTextActive: {
      color: 'white',
    },
    previewSection: {
      marginBottom: theme.spacing.lg,
    },
    previewCard: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    previewColor: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginBottom: theme.spacing.md,
      borderWidth: 3,
      borderColor: theme.colors.border,
    },
    previewName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    previewDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
    },
    previewType: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
      fontWeight: '500',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.xs,
      marginTop: theme.spacing.sm,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    button: {
      flex: 1,
    },
  });
  
  return (
    <View style={dynamicStyles.container}>
      <Header 
        title={isEditing ? 'Edit Category' : 'New Category'}
        leftComponent={
          <TouchableOpacity onPress={handleCancel}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={handleSave}>
            <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '600' }}>
              Save
            </Text>
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={dynamicStyles.content}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 80, 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Section */}
        <View style={dynamicStyles.previewSection}>
          <Text style={dynamicStyles.sectionTitle}>Preview</Text>
          <Card style={dynamicStyles.previewCard}>
            <View style={[dynamicStyles.previewColor, { backgroundColor: formData.color }]} />
            <Text style={dynamicStyles.previewName}>
              {formData.name || 'Category Name'}
            </Text>
            {formData.description && (
              <Text style={dynamicStyles.previewDescription}>
                {formData.description}
              </Text>
            )}
            <Text style={dynamicStyles.previewType}>
              {formData.type === 'both' ? 'Tasks & Habits' : 
               formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
            </Text>
          </Card>
        </View>
        
        {/* Form Section */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Details</Text>
          
          <TextInput
            label="Category Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter category name"
            error={errors.name}
            maxLength={30}
          />
          
          <TextInput
            label="Description (Optional)"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Enter category description"
            error={errors.description}
            maxLength={100}
            multiline
          />
          
          <ColorPicker
            selectedColor={formData.color}
            onColorSelect={(color) => setFormData({ ...formData, color })}
          />
          
          <View style={dynamicStyles.typeContainer}>
            <Text style={dynamicStyles.typeLabel}>Category Type</Text>
            <View style={dynamicStyles.typeButtons}>
              <TouchableOpacity
                style={[
                  dynamicStyles.typeButton,
                  formData.type === 'task' && dynamicStyles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: 'task' })}
                disabled={isEditing && existingCategory?.isDefault}
              >
                <Text style={[
                  dynamicStyles.typeButtonText,
                  formData.type === 'task' && dynamicStyles.typeButtonTextActive,
                ]}>
                  Tasks
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  dynamicStyles.typeButton,
                  formData.type === 'habit' && dynamicStyles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: 'habit' })}
                disabled={isEditing && existingCategory?.isDefault}
              >
                <Text style={[
                  dynamicStyles.typeButtonText,
                  formData.type === 'habit' && dynamicStyles.typeButtonTextActive,
                ]}>
                  Habits
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  dynamicStyles.typeButton,
                  formData.type === 'both' && dynamicStyles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type: 'both' })}
                disabled={isEditing && existingCategory?.isDefault}
              >
                <Text style={[
                  dynamicStyles.typeButtonText,
                  formData.type === 'both' && dynamicStyles.typeButtonTextActive,
                ]}>
                  Both
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={dynamicStyles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="outline"
            style={dynamicStyles.button}
          />
          <Button
            title={isEditing ? 'Update' : 'Create'}
            onPress={handleSave}
            style={dynamicStyles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
};
