import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import { Habit, addHabit, updateHabit, deleteHabit, completeHabit } from '../../store/slices/habitSlice';
import { HabitItem } from '../../components/habits/HabitItem';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';

export const HabitsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const habits = useAppSelector((state) => state.habits.habits);
  const categories = useAppSelector((state) => state.habits.categories);
  
  // State for habit form
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHabit, setCurrentHabit] = useState<Partial<Habit>>({
    title: '',
    description: '',
    category: 'Morning',
    frequency: {
      type: 'daily',
      days: [0, 1, 2, 3, 4, 5, 6], // All days of the week
      times: {
        morning: true,
        afternoon: false,
        evening: false,
      },
    },
    color: theme.colors_extended.primary[theme.dark ? 'dark' : 'light'],
  });
  
  // State for filtering
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterFrequency, setFilterFrequency] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  
  // Filter habits based on current filters
  const filteredHabits = habits.filter((habit) => {
    // Filter by category
    if (filterCategory && habit.category !== filterCategory) return false;
    
    // Filter by frequency
    if (filterFrequency && habit.frequency.type !== filterFrequency) return false;
    
    return true;
  });
  
  // Sort habits: by category, then by title
  const sortedHabits = [...filteredHabits].sort((a, b) => {
    // Sort by category
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    
    // Then by title
    return a.title.localeCompare(b.title);
  });
  
  // Handle habit toggle
  const handleToggleComplete = (id: string, date: string, completed: boolean) => {
    dispatch(completeHabit({ id, date, completed }));
  };
  
  // Handle habit deletion
  const handleDeleteHabit = (id: string) => {
    dispatch(deleteHabit(id));
  };
  
  // Handle habit edit
  const handleEditHabit = (habit: Habit) => {
    setCurrentHabit(habit);
    setIsEditing(true);
    setIsModalVisible(true);
  };
  
  // Handle form submission
  const handleSubmitHabit = () => {
    if (!currentHabit.title) return; // Don't submit if title is empty
    
    if (isEditing && currentHabit.id) {
      dispatch(updateHabit(currentHabit as Habit));
    } else {
      dispatch(
        addHabit({
          title: currentHabit.title,
          description: currentHabit.description || '',
          category: currentHabit.category || 'Morning',
          frequency: currentHabit.frequency || {
            type: 'daily',
            days: [0, 1, 2, 3, 4, 5, 6],
            times: { morning: true },
          },
          color: currentHabit.color || theme.colors_extended.primary[theme.dark ? 'dark' : 'light'],
        })
      );
    }
    
    // Reset form and close modal
    setIsModalVisible(false);
    setIsEditing(false);
    setCurrentHabit({
      title: '',
      description: '',
      category: 'Morning',
      frequency: {
        type: 'daily',
        days: [0, 1, 2, 3, 4, 5, 6],
        times: {
          morning: true,
          afternoon: false,
          evening: false,
        },
      },
      color: theme.colors_extended.primary[theme.dark ? 'dark' : 'light'],
    });
  };
  
  // Handle adding a new habit
  const handleAddHabit = () => {
    setIsEditing(false);
    setCurrentHabit({
      title: '',
      description: '',
      category: 'Morning',
      frequency: {
        type: 'daily',
        days: [0, 1, 2, 3, 4, 5, 6],
        times: {
          morning: true,
          afternoon: false,
          evening: false,
        },
      },
      color: theme.colors_extended.primary[theme.dark ? 'dark' : 'light'],
    });
    setIsModalVisible(true);
  };
  
  // Handle canceling the form
  const handleCancelForm = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setCurrentHabit({
      title: '',
      description: '',
      category: 'Morning',
      frequency: {
        type: 'daily',
        days: [0, 1, 2, 3, 4, 5, 6],
        times: {
          morning: true,
          afternoon: false,
          evening: false,
        },
      },
      color: theme.colors_extended.primary[theme.dark ? 'dark' : 'light'],
    });
  };
  
  // Handle frequency type change
  const handleFrequencyTypeChange = (type: 'daily' | 'weekly' | 'monthly') => {
    setCurrentHabit({
      ...currentHabit,
      frequency: {
        ...currentHabit.frequency!,
        type,
        // Reset days for weekly if changing from another type
        ...(type === 'weekly' && currentHabit.frequency?.type !== 'weekly'
          ? { days: [1, 2, 3, 4, 5] } // Mon-Fri
          : {}),
      },
    });
  };
  
  // Handle day selection for weekly frequency
  const handleDayToggle = (day: number) => {
    const currentDays = currentHabit.frequency?.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    
    setCurrentHabit({
      ...currentHabit,
      frequency: {
        ...currentHabit.frequency!,
        days: newDays,
      },
    });
  };
  
  // Handle time of day selection
  const handleTimeOfDayToggle = (time: 'morning' | 'afternoon' | 'evening') => {
    setCurrentHabit({
      ...currentHabit,
      frequency: {
        ...currentHabit.frequency!,
        times: {
          ...currentHabit.frequency?.times,
          [time]: !(currentHabit.frequency?.times?.[time] || false),
        },
      },
    });
  };
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    setCurrentHabit({
      ...currentHabit,
      color,
    });
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    filterContainer: {
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterButtonText: {
      color: theme.colors.text,
      fontSize: theme.typography.fontSize.sm,
    },
    filterButtonTextActive: {
      color: 'white',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.md,
    },
    fabText: {
      fontSize: 24,
      color: 'white',
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: theme.spacing.md,
    },
    modalContent: {
      width: '100%',
      maxWidth: 500,
      maxHeight: '90%',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      ...theme.shadows.lg,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    formRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    frequencyButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    frequencyButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    frequencyButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
    },
    dayButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.xs,
    },
    dayButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dayButtonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    dayButtonTextActive: {
      color: 'white',
    },
    timeButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    timeButtonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    timeButtonTextActive: {
      color: 'white',
    },
    categoryButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    categoryButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryButtonText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
    },
    categoryButtonTextActive: {
      color: 'white',
    },
    colorButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    colorButtonActive: {
      borderColor: theme.colors.text,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.md,
    },
  });
  
  // Render frequency type button
  const renderFrequencyButton = (type: 'daily' | 'weekly' | 'monthly', label: string) => {
    const isActive = currentHabit.frequency?.type === type;
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.frequencyButton,
          isActive && dynamicStyles.frequencyButtonActive,
        ]}
        onPress={() => handleFrequencyTypeChange(type)}
      >
        <Text
          style={[
            dynamicStyles.frequencyButtonText,
            { color: isActive ? 'white' : theme.colors.text },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render day button for weekly frequency
  const renderDayButton = (day: number, label: string) => {
    const isActive = currentHabit.frequency?.days?.includes(day) || false;
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.dayButton,
          isActive && dynamicStyles.dayButtonActive,
        ]}
        onPress={() => handleDayToggle(day)}
      >
        <Text
          style={[
            dynamicStyles.dayButtonText,
            isActive && dynamicStyles.dayButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render time of day button
  const renderTimeButton = (time: 'morning' | 'afternoon' | 'evening', label: string) => {
    const isActive = currentHabit.frequency?.times?.[time] || false;
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.timeButton,
          isActive && dynamicStyles.timeButtonActive,
        ]}
        onPress={() => handleTimeOfDayToggle(time)}
      >
        <Text
          style={[
            dynamicStyles.timeButtonText,
            isActive && dynamicStyles.timeButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render color button
  const renderColorButton = (color: string) => {
    const isActive = currentHabit.color === color;
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.colorButton,
          { backgroundColor: color },
          isActive && dynamicStyles.colorButtonActive,
        ]}
        onPress={() => handleColorSelect(color)}
      />
    );
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={dynamicStyles.emptyContainer}>
      <Text style={dynamicStyles.emptyText}>
        No habits found. Add a new habit to get started!
      </Text>
      <Button title="Add Habit" onPress={handleAddHabit} variant="primary" />
    </View>
  );
  
  // Available colors for habits
  const habitColors = [
    theme.colors_extended.primary[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.secondary[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.success[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.danger[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.warning[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.info[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.categories.personal[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.categories.work[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.categories.health[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.categories.shopping[theme.dark ? 'dark' : 'light'],
    theme.colors_extended.categories.other[theme.dark ? 'dark' : 'light'],
  ];
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header 
        title="Habits" 
        subtitle={`${habits.length} total habits`}
        rightComponent={
          <TouchableOpacity onPress={handleAddHabit}>
            <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '600' }}>
              Add
            </Text>
          </TouchableOpacity>
        }
      />
      <View style={dynamicStyles.container}>
      
      {/* Filters */}
      <View style={dynamicStyles.filterContainer}>
        {/* Category filters */}
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterCategory === null && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterCategory(null)}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterCategory === null && dynamicStyles.filterButtonTextActive,
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              dynamicStyles.filterButton,
              filterCategory === category && dynamicStyles.filterButtonActive,
            ]}
            onPress={() => setFilterCategory(category === filterCategory ? null : category)}
          >
            <Text
              style={[
                dynamicStyles.filterButtonText,
                filterCategory === category && dynamicStyles.filterButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={dynamicStyles.filterContainer}>
        {/* Frequency filters */}
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterFrequency === null && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterFrequency(null)}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterFrequency === null && dynamicStyles.filterButtonTextActive,
            ]}
          >
            All Frequencies
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterFrequency === 'daily' && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterFrequency(filterFrequency === 'daily' ? null : 'daily')}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterFrequency === 'daily' && dynamicStyles.filterButtonTextActive,
            ]}
          >
            Daily
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterFrequency === 'weekly' && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterFrequency(filterFrequency === 'weekly' ? null : 'weekly')}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterFrequency === 'weekly' && dynamicStyles.filterButtonTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterFrequency === 'monthly' && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterFrequency(filterFrequency === 'monthly' ? null : 'monthly')}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterFrequency === 'monthly' && dynamicStyles.filterButtonTextActive,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Habit List */}
      {sortedHabits.length > 0 ? (
        <FlatList
          data={sortedHabits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitItem
              habit={item}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteHabit}
              onEdit={handleEditHabit}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
      
      {/* Add Habit FAB */}
      <TouchableOpacity style={dynamicStyles.fab} onPress={handleAddHabit}>
        <Text style={dynamicStyles.fabText}>+</Text>
      </TouchableOpacity>
      
      {/* Habit Form Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelForm}
      >
        <View style={dynamicStyles.modalContainer}>
          <Card style={dynamicStyles.modalContent} elevation="large">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={dynamicStyles.modalTitle}>
                {isEditing ? 'Edit Habit' : 'Add New Habit'}
              </Text>
              
              <TextInput
                label="Title"
                value={currentHabit.title}
                onChangeText={(text) => setCurrentHabit({ ...currentHabit, title: text })}
                placeholder="Enter habit title"
              />
              
              <TextInput
                label="Description (optional)"
                value={currentHabit.description}
                onChangeText={(text) => setCurrentHabit({ ...currentHabit, description: text })}
                placeholder="Enter habit description"
                multiline
                numberOfLines={3}
              />
              
              <Text style={dynamicStyles.sectionTitle}>Frequency</Text>
              <View style={dynamicStyles.formRow}>
                {renderFrequencyButton('daily', 'Daily')}
                {renderFrequencyButton('weekly', 'Weekly')}
                {renderFrequencyButton('monthly', 'Monthly')}
              </View>
              
              {currentHabit.frequency?.type === 'weekly' && (
                <>
                  <Text style={dynamicStyles.sectionTitle}>Days of Week</Text>
                  <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
                    {renderDayButton(0, 'S')}
                    {renderDayButton(1, 'M')}
                    {renderDayButton(2, 'T')}
                    {renderDayButton(3, 'W')}
                    {renderDayButton(4, 'T')}
                    {renderDayButton(5, 'F')}
                    {renderDayButton(6, 'S')}
                  </View>
                </>
              )}
              
              <Text style={dynamicStyles.sectionTitle}>Time of Day</Text>
              <View style={dynamicStyles.formRow}>
                {renderTimeButton('morning', 'Morning')}
                {renderTimeButton('afternoon', 'Afternoon')}
                {renderTimeButton('evening', 'Evening')}
              </View>
              
              <Text style={dynamicStyles.sectionTitle}>Category</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      dynamicStyles.categoryButton,
                      currentHabit.category === category && dynamicStyles.categoryButtonActive,
                    ]}
                    onPress={() => setCurrentHabit({ ...currentHabit, category })}
                  >
                    <Text
                      style={[
                        dynamicStyles.categoryButtonText,
                        currentHabit.category === category && dynamicStyles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={dynamicStyles.sectionTitle}>Color</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
                {habitColors.map((color) => renderColorButton(color))}
              </View>
              
              <View style={dynamicStyles.buttonContainer}>
                <Button
                  title="Cancel"
                  onPress={handleCancelForm}
                  variant="outline"
                  style={{ marginRight: theme.spacing.md }}
                />
                <Button
                  title={isEditing ? 'Update' : 'Add'}
                  onPress={handleSubmitHabit}
                  variant="primary"
                  disabled={!currentHabit.title}
                />
              </View>
            </ScrollView>
          </Card>
        </View>
      </Modal>
      </View>
    </View>
  );
};
