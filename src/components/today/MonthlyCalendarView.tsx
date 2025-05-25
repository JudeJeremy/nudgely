import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../store/slices/taskSlice';
import { Habit } from '../../store/slices/habitSlice';

interface MonthlyCalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasks: Task[];
  habits: Habit[];
}

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  selectedDate,
  onDateSelect,
  tasks,
  habits,
}) => {
  const theme = useTheme();
  
  // Get calendar grid for the selected month
  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks) to fill the calendar grid
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };
  
  // Check if habit is scheduled for the given date
  const isHabitScheduledForDate = (habit: Habit, date: Date) => {
    if (habit.frequency.type === 'daily') {
      return true;
    } else if (habit.frequency.type === 'weekly' && habit.frequency.days) {
      return habit.frequency.days.includes(date.getDay());
    } else if (habit.frequency.type === 'monthly') {
      return date.getDate() === 1;
    }
    return false;
  };
  
  // Get items for a specific date
  const getItemsForDate = (date: Date) => {
    // Normalize the date to compare with task dates
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const items: { title: string; color: string; type: 'task' | 'habit' }[] = [];
    
    // Add tasks for this date
    tasks.forEach((task) => {
      if (task.dueDate) {
        // Normalize task date for comparison
        const taskDate = new Date(task.dueDate);
        const taskDateStr = taskDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        if (taskDateStr === dateStr) {
          items.push({
            title: task.title,
            color: getCategoryColor(task.category),
            type: 'task',
          });
        }
      }
    });
    
    // Add habits for this date
    habits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, date)) {
        items.push({
          title: habit.title,
          color: habit.color,
          type: 'habit',
        });
      }
    });
    
    return items.slice(0, 3); // Limit to 3 items for display
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
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dayHeader: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    dayHeaderText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '600',
      color: theme.colors.text,
      opacity: 0.7,
    },
    calendarGrid: {
      flex: 1,
      paddingHorizontal: theme.spacing.sm,
    },
    weekRow: {
      flexDirection: 'row',
      flex: 1,
    },
    dayCell: {
      flex: 1,
      margin: 1,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
      minHeight: 80,
      justifyContent: 'flex-start',
    },
    selectedDayCell: {
      backgroundColor: theme.colors.primary,
    },
    todayCell: {
      backgroundColor: theme.colors_extended.warning[theme.dark ? 'dark' : 'light'],
    },
    otherMonthCell: {
      opacity: 0.3,
    },
    dayNumber: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    selectedDayNumber: {
      color: 'white',
    },
    itemsContainer: {
      flex: 1,
    },
    item: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 1,
      borderRadius: 2,
      marginBottom: 1,
    },
    itemText: {
      fontSize: 8,
      color: 'white',
      fontWeight: '500',
    },
    moreItems: {
      fontSize: 8,
      color: theme.colors.text,
      opacity: 0.7,
      fontWeight: '500',
    },
  });
  
  const calendarDays = getCalendarDays();
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <View style={dynamicStyles.container}>
      {/* Day headers */}
      <View style={dynamicStyles.header}>
        {dayHeaders.map((day) => (
          <View key={day} style={dynamicStyles.dayHeader}>
            <Text style={dynamicStyles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <View style={dynamicStyles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={dynamicStyles.weekRow}>
            {week.map((date, dayIndex) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === today.toDateString();
              const isCurrentMonth = date.getMonth() === currentMonth;
              const items = getItemsForDate(date);
              
              const cellStyle = [
                dynamicStyles.dayCell,
                !isCurrentMonth && dynamicStyles.otherMonthCell,
                isSelected && dynamicStyles.selectedDayCell,
                !isSelected && isToday && dynamicStyles.todayCell,
              ].filter(Boolean);
              
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={cellStyle}
                  onPress={() => onDateSelect(date)}
                >
                  <Text style={[
                    dynamicStyles.dayNumber,
                    (isSelected || isToday) && dynamicStyles.selectedDayNumber,
                  ]}>
                    {date.getDate()}
                  </Text>
                  
                  <View style={dynamicStyles.itemsContainer}>
                    {items.slice(0, 2).map((item, index) => (
                      <View
                        key={index}
                        style={[
                          dynamicStyles.item,
                          { backgroundColor: item.color }
                        ]}
                      >
                        <Text style={dynamicStyles.itemText} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                    ))}
                    {items.length > 2 && (
                      <Text style={dynamicStyles.moreItems}>
                        +{items.length - 2} more
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};
