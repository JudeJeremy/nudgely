import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import { Task, toggleTaskCompletion, toggleTaskStar } from '../../store/slices/taskSlice';
import { Habit, completeHabit } from '../../store/slices/habitSlice';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';

interface TodayItem {
  id: string;
  type: 'task' | 'habit';
  title: string;
  description?: string;
  completed: boolean;
  starred?: boolean;
  dueDate?: string;
  color?: string;
  category: string;
  progress?: string;
  streak?: number;
}

export const TodayScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const habits = useAppSelector((state) => state.habits.habits);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get date range for scrollable dates (2 weeks)
  const getScrollableDates = () => {
    const dates = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Start from 1 week ago
    
    for (let i = 0; i < 21; i++) { // 3 weeks total
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  
  // Check if habit is scheduled for the selected date
  const isHabitScheduledForDate = (habit: Habit, date: Date) => {
    if (habit.frequency.type === 'daily') {
      return true;
    } else if (habit.frequency.type === 'weekly' && habit.frequency.days) {
      return habit.frequency.days.includes(date.getDay());
    } else if (habit.frequency.type === 'monthly') {
      // Simplified: show monthly habits on the first day of the month
      return date.getDate() === 1;
    }
    return false;
  };
  
  // Check if habit is completed for the selected date
  const isHabitCompletedForDate = (habit: Habit, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return habit.completions.some(
      (completion) => 
        completion.date.split('T')[0] === dateString && 
        completion.completed
    );
  };
  
  // Get tasks and habits for the selected date
  const getTodayItems = (): TodayItem[] => {
    const items: TodayItem[] = [];
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    
    // Add tasks due today (only if they have due dates)
    tasks.forEach((task) => {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        if (taskDate === selectedDateString) {
          items.push({
            id: task.id,
            type: 'task',
            title: task.title,
            description: task.description,
            completed: task.completed,
            starred: task.starred,
            dueDate: task.dueDate,
            category: task.category,
          });
        }
      }
    });
    
    // Add habits scheduled for today
    habits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, selectedDate)) {
        items.push({
          id: habit.id,
          type: 'habit',
          title: habit.title,
          description: habit.description,
          completed: isHabitCompletedForDate(habit, selectedDate),
          color: habit.color,
          category: habit.category,
          streak: habit.currentStreak,
        });
      }
    });
    
    // Sort by completion status (incomplete first), then by type
    return items.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return a.type.localeCompare(b.type);
    });
  };
  
  // Handle task completion toggle
  const handleTaskToggle = (id: string) => {
    dispatch(toggleTaskCompletion(id));
  };
  
  // Handle task star toggle
  const handleTaskStar = (id: string) => {
    dispatch(toggleTaskStar(id));
  };
  
  // Handle habit completion toggle
  const handleHabitToggle = (id: string, completed: boolean) => {
    const dateString = selectedDate.toISOString();
    dispatch(completeHabit({ id, date: dateString, completed: !completed }));
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format date for header subtitle
  const formatHeaderDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    dateSelector: {
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dateScrollView: {
      paddingHorizontal: theme.spacing.md,
    },
    dateItem: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.sm,
      minWidth: 50,
    },
    selectedDateItem: {
      backgroundColor: theme.colors.primary,
    },
    dayText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 2,
    },
    selectedDayText: {
      color: 'white',
    },
    dateText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
    },
    selectedDateText: {
      color: 'white',
    },
    contentContainer: {
      flex: 1,
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    itemContainer: {
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      marginRight: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'white',
    },
    itemDetails: {
      flex: 1,
    },
    itemTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    itemDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.8,
      marginTop: 2,
    },
    itemMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    categoryText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.7,
      marginRight: theme.spacing.sm,
    },
    streakText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    starButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
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
    },
  });
  
  const renderDateItem = (date: Date, index: number) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          dynamicStyles.dateItem,
          isSelected && dynamicStyles.selectedDateItem,
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          dynamicStyles.dayText,
          isSelected && dynamicStyles.selectedDayText,
        ]}>
          {dayNames[date.getDay()]}
        </Text>
        <Text style={[
          dynamicStyles.dateText,
          isSelected && dynamicStyles.selectedDateText,
        ]}>
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderTodayItem = (item: TodayItem) => {
    const borderColor = item.type === 'habit' ? item.color : theme.colors.primary;
    const checkboxColor = item.type === 'habit' ? item.color : theme.colors.primary;
    
    const itemStyle = {
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: borderColor || theme.colors.primary,
    };
    
    return (
      <Card key={item.id} style={itemStyle}>
        <View style={dynamicStyles.itemContent}>
          <TouchableOpacity
            style={[
              dynamicStyles.checkbox,
              {
                borderColor: checkboxColor || theme.colors.primary,
                backgroundColor: item.completed ? checkboxColor || theme.colors.primary : 'transparent',
              }
            ]}
            onPress={() => {
              if (item.type === 'task') {
                handleTaskToggle(item.id);
              } else {
                handleHabitToggle(item.id, item.completed);
              }
            }}
          >
            {item.completed && <View style={dynamicStyles.checkboxInner} />}
          </TouchableOpacity>
          
          <View style={dynamicStyles.itemDetails}>
            <Text style={[
              dynamicStyles.itemTitle,
              { textDecorationLine: item.completed ? 'line-through' : 'none' }
            ]}>
              {item.title}
            </Text>
            
            {item.description && (
              <Text style={[
                dynamicStyles.itemDescription,
                { textDecorationLine: item.completed ? 'line-through' : 'none' }
              ]}>
                {item.description}
              </Text>
            )}
            
            <View style={dynamicStyles.itemMeta}>
              <Text style={dynamicStyles.categoryText}>
                {item.category}
              </Text>
              
              {item.type === 'habit' && item.streak !== undefined && (
                <Text style={dynamicStyles.streakText}>
                  {item.streak} day streak
                </Text>
              )}
            </View>
          </View>
          
          {item.type === 'task' && (
            <TouchableOpacity
              style={dynamicStyles.starButton}
              onPress={() => handleTaskStar(item.id)}
            >
              <Ionicons
                name={item.starred ? 'star' : 'star-outline'}
                size={20}
                color={item.starred ? theme.colors_extended.warning[theme.dark ? 'dark' : 'light'] : theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };
  
  const todayItems = getTodayItems();
  
  return (
    <View style={dynamicStyles.container}>
      <Header 
        title="Today" 
        subtitle={formatHeaderDate(selectedDate)}
      />
      
      {/* Scrollable Date Selector */}
      <View style={dynamicStyles.dateSelector}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dynamicStyles.dateScrollView}
        >
          {getScrollableDates().map((date, index) => renderDateItem(date, index))}
        </ScrollView>
      </View>
      
      {/* Content */}
      <ScrollView style={dynamicStyles.contentContainer}>
        {todayItems.length > 0 ? (
          <>
            <Text style={dynamicStyles.sectionTitle}>
              {todayItems.length} {todayItems.length === 1 ? 'item' : 'items'} for {formatDate(selectedDate)}
            </Text>
            {todayItems.map(renderTodayItem)}
          </>
        ) : (
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>
              No tasks or habits scheduled for {formatDate(selectedDate)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
