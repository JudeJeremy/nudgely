import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../store/slices/taskSlice';
import { Habit } from '../../store/slices/habitSlice';

interface WeekViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasks: Task[];
  habits: Habit[];
}

export const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  onDateSelect,
  tasks,
  habits,
}) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get week dates (7 days centered around selected date)
  const getWeekDates = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  
  // Get category colors for items on a specific date
  const getDateColors = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const colors: string[] = [];
    
    // Check tasks for this date
    tasks.forEach((task) => {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        if (taskDate === dateString) {
          const categoryColor = getCategoryColor(task.category);
          if (!colors.includes(categoryColor)) {
            colors.push(categoryColor);
          }
        }
      }
    });
    
    // Check habits for this date
    habits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, date)) {
        if (!colors.includes(habit.color)) {
          colors.push(habit.color);
        }
      }
    });
    
    return colors.slice(0, 3); // Limit to 3 colors max
  };
  
  // Check if habit is scheduled for the given date
  const isHabitScheduledForDate = (habit: Habit, date: Date) => {
    if (habit.frequency.type === 'daily') {
      return true;
    } else if (habit.frequency.type === 'weekly' && habit.frequency.days) {
      return habit.frequency.days.includes(date.getDay());
    } else if (habit.frequency.type === 'monthly') {
      return date.getDate() === 1; // Simplified: show on first day of month
    }
    return false;
  };
  
  // Get category color
  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'personal': theme.colors_extended.categories.personal[theme.dark ? 'dark' : 'light'],
      'work': theme.colors_extended.categories.work[theme.dark ? 'dark' : 'light'],
      'health': theme.colors_extended.categories.health[theme.dark ? 'dark' : 'light'],
      'shopping': theme.colors_extended.categories.shopping[theme.dark ? 'dark' : 'light'],
      'fitness': theme.colors_extended.success[theme.dark ? 'dark' : 'light'],
      'learning': theme.colors_extended.info[theme.dark ? 'dark' : 'light'],
      'mindfulness': theme.colors_extended.warning[theme.dark ? 'dark' : 'light'],
    };
    
    return categoryColors[category.toLowerCase()] || theme.colors_extended.categories.other[theme.dark ? 'dark' : 'light'];
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    scrollView: {
      paddingHorizontal: theme.spacing.md,
    },
    dateItem: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.sm,
      minWidth: 50,
    },
    selectedDateItem: {
      backgroundColor: theme.colors.primary,
    },
    todayDateItem: {
      backgroundColor: theme.colors_extended.warning[theme.dark ? 'dark' : 'light'],
    },
    dayText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.7,
      marginBottom: 2,
      fontWeight: '500',
    },
    selectedDayText: {
      color: 'white',
      opacity: 1,
    },
    dateText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    selectedDateText: {
      color: 'white',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 8,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginHorizontal: 1,
    },
    moreDots: {
      fontSize: 8,
      color: theme.colors.text,
      opacity: 0.7,
      marginLeft: 2,
    },
  });
  
  const weekDates = getWeekDates();
  const today = new Date();
  
  return (
    <View style={dynamicStyles.container}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.scrollView}
      >
        {weekDates.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          const colors = getDateColors(date);
          const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
          
          const itemStyle = [
            dynamicStyles.dateItem,
            isSelected && dynamicStyles.selectedDateItem,
            !isSelected && isToday && dynamicStyles.todayDateItem,
          ].filter(Boolean);
          
          return (
            <TouchableOpacity
              key={index}
              style={itemStyle}
              onPress={() => onDateSelect(date)}
            >
              <Text style={[
                dynamicStyles.dayText,
                (isSelected || isToday) && dynamicStyles.selectedDayText,
              ]}>
                {dayNames[date.getDay()]}
              </Text>
              <Text style={[
                dynamicStyles.dateText,
                (isSelected || isToday) && dynamicStyles.selectedDateText,
              ]}>
                {date.getDate()}
              </Text>
              
              {/* Color dots */}
              <View style={dynamicStyles.dotsContainer}>
                {colors.slice(0, 3).map((color, colorIndex) => (
                  <View
                    key={colorIndex}
                    style={[
                      dynamicStyles.dot,
                      { backgroundColor: color }
                    ]}
                  />
                ))}
                {colors.length > 3 && (
                  <Text style={dynamicStyles.moreDots}>...</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
