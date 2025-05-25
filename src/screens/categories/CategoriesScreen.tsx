import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import { deleteCategory, resetCategories } from '../../store/slices/categorySlice';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Category } from '../../store/slices/categorySlice';

export const CategoriesScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [selectedTab, setSelectedTab] = useState<'task' | 'habit' | 'all'>('all');
  
  const categories = useAppSelector((state) => state.categories.categories);
  
  // Filter categories based on selected tab
  const filteredCategories = categories.filter((category) => {
    if (selectedTab === 'all') return true;
    return category.type === selectedTab || category.type === 'both';
  });
  
  // Sort categories: default first, then by usage count, then by name
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
    return a.name.localeCompare(b.name);
  });
  
  const handleDeleteCategory = (category: Category) => {
    if (category.isDefault) {
      Alert.alert(
        'Cannot Delete',
        'Default categories cannot be deleted.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteCategory(category.id)),
        },
      ]
    );
  };
  
  const handleEditCategory = (category: Category) => {
    (navigation as any).navigate('CategoryForm', { categoryId: category.id });
  };
  
  const handleAddCategory = () => {
    (navigation as any).navigate('CategoryForm', { initialType: selectedTab === 'all' ? 'task' : selectedTab });
  };
  
  const handleResetCategories = () => {
    Alert.alert(
      'Reset Categories',
      'Are you sure you want to reset all categories to default? This will delete all custom categories.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => dispatch(resetCategories()),
        },
      ]
    );
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    tabContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      fontWeight: '500',
    },
    tabTextActive: {
      color: 'white',
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    categoryCard: {
      marginBottom: theme.spacing.md,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    categoryIcon: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    categoryColor: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: theme.spacing.md,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    categoryDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.7,
    },
    categoryMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    categoryType: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
      fontWeight: '500',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.xs,
      marginRight: theme.spacing.sm,
    },
    categoryUsage: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.6,
    },
    categoryActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    defaultBadge: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors_extended.warning[theme.dark ? 'dark' : 'light'],
      fontWeight: '500',
      backgroundColor: theme.colors_extended.warning[theme.dark ? 'dark' : 'light'] + '20',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.xs,
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
      marginBottom: theme.spacing.md,
    },
    addButton: {
      marginTop: theme.spacing.lg,
    },
    resetButton: {
      marginTop: theme.spacing.md,
      alignSelf: 'center',
    },
  });
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <Card style={dynamicStyles.categoryCard}>
      <View style={dynamicStyles.categoryItem}>
        <View style={[dynamicStyles.categoryColor, { backgroundColor: item.color }]} />
        
        <View style={dynamicStyles.categoryInfo}>
          <Text style={dynamicStyles.categoryName}>{item.name}</Text>
          {item.description && (
            <Text style={dynamicStyles.categoryDescription}>{item.description}</Text>
          )}
          <View style={dynamicStyles.categoryMeta}>
            <Text style={dynamicStyles.categoryType}>
              {item.type === 'both' ? 'Tasks & Habits' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
            <Text style={dynamicStyles.categoryUsage}>
              Used {item.usageCount} time{item.usageCount !== 1 ? 's' : ''}
            </Text>
            {item.isDefault && (
              <Text style={dynamicStyles.defaultBadge}>Default</Text>
            )}
          </View>
        </View>
        
        <View style={dynamicStyles.categoryActions}>
          <TouchableOpacity
            style={dynamicStyles.actionButton}
            onPress={() => handleEditCategory(item)}
          >
            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {!item.isDefault && (
            <TouchableOpacity
              style={dynamicStyles.actionButton}
              onPress={() => handleDeleteCategory(item)}
            >
              <Ionicons 
                name="trash" 
                size={20} 
                color={theme.colors_extended.danger[theme.dark ? 'dark' : 'light']} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );
  
  return (
    <View style={dynamicStyles.container}>
      <Header 
        title="Categories" 
        leftComponent={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={handleResetCategories}>
            <Text style={{ color: theme.colors_extended.danger[theme.dark ? 'dark' : 'light'], fontSize: 16, fontWeight: '600' }}>
              Reset
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
        {/* Tab Selector */}
        <View style={dynamicStyles.tabContainer}>
          <TouchableOpacity
            style={[dynamicStyles.tab, selectedTab === 'all' && dynamicStyles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[
              dynamicStyles.tabText,
              selectedTab === 'all' && dynamicStyles.tabTextActive,
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.tab, selectedTab === 'task' && dynamicStyles.tabActive]}
            onPress={() => setSelectedTab('task')}
          >
            <Text style={[
              dynamicStyles.tabText,
              selectedTab === 'task' && dynamicStyles.tabTextActive,
            ]}>
              Tasks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[dynamicStyles.tab, selectedTab === 'habit' && dynamicStyles.tabActive]}
            onPress={() => setSelectedTab('habit')}
          >
            <Text style={[
              dynamicStyles.tabText,
              selectedTab === 'habit' && dynamicStyles.tabTextActive,
            ]}>
              Habits
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Categories List */}
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>
            {selectedTab === 'all' ? 'All Categories' : 
             selectedTab === 'task' ? 'Task Categories' : 'Habit Categories'}
          </Text>
        </View>
        
        {sortedCategories.length > 0 ? (
          <FlatList
            data={sortedCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={dynamicStyles.emptyState}>
            <Text style={dynamicStyles.emptyStateText}>
              No categories found for the selected filter.
            </Text>
          </View>
        )}
        
        {/* Add Category Button */}
        <Button
          title="Add New Category"
          onPress={handleAddCategory}
          style={dynamicStyles.addButton}
          icon={<Ionicons name="add" size={20} color="white" />}
        />
      </ScrollView>
    </View>
  );
};
