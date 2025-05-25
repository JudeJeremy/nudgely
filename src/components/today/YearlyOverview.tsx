import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Task } from '../../store/slices/taskSlice';
import { Habit } from '../../store/slices/habitSlice';

interface YearlyOverviewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
  habits: Habit[];
}

export const YearlyOverview: React.FC<YearlyOverviewProps> = ({
  selectedDate,
  onDateChange,
  tasks,
  habits,
}) => {
  const theme = useTheme();
  
  // Get months for the selected year
  const getYearMonths = () => {
    const year = selectedDate.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1));
    }
    
    return months;
  };
  
  // Get activity count for a month
  const getMonthActivityCount = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    let count = 0;
    
    // Count tasks for this month
    tasks.forEach((task) => {
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
          count++;
        }
      }
    });
    
    // Count habits (simplified - count unique habits scheduled for this month)
    const monthHabits = new Set();
    habits.forEach((habit) => {
      if (habit.frequency.type === 'daily' || habit.frequency.type === 'weekly') {
        monthHabits.add(habit.id);
      } else if (habit.frequency.type === 'monthly') {
        monthHabits.add(habit.id);
      }
    });
    
    count += monthHabits.size;
    return count;
  };
  
  // Get activity intensity color
  const getActivityIntensity = (count: number) => {
    if (count === 0) return theme.colors.card;
    if (count <= 5) return theme.colors_extended.success[theme.dark ? 'dark' : 'light'] + '40';
    if (count <= 15) return theme.colors_extended.success[theme.dark ? 'dark' : 'light'] + '70';
    return theme.colors_extended.success[theme.dark ? 'dark' : 'light'];
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    yearHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    yearText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    monthsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    monthCard: {
      width: '48%',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedMonthCard: {
      borderColor: theme.colors.primary,
    },
    currentMonthCard: {
      borderColor: theme.colors_extended.warning[theme.dark ? 'dark' : 'light'],
    },
    monthHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    monthName: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    activityCount: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.7,
    },
    activityIndicator: {
      height: 8,
      borderRadius: 4,
      marginBottom: theme.spacing.xs,
    },
    monthStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.7,
    },
    legend: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
    },
    legendTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    legendColor: {
      width: 16,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.sm,
    },
    legendText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.7,
    },
  });
  
  const yearMonths = getYearMonths();
  const currentDate = new Date();
  const selectedYear = selectedDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Year Header */}
      <View style={dynamicStyles.yearHeader}>
        <Text style={dynamicStyles.yearText}>{selectedYear}</Text>
      </View>
      
      {/* Months Grid */}
      <View style={dynamicStyles.monthsGrid}>
        {yearMonths.map((monthDate, index) => {
          const isSelected = monthDate.getMonth() === selectedDate.getMonth();
          const isCurrent = selectedYear === currentYear && index === currentMonth;
          const activityCount = getMonthActivityCount(monthDate);
          const intensityColor = getActivityIntensity(activityCount);
          
          // Get task and habit counts separately
          const taskCount = tasks.filter(task => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate.getFullYear() === selectedYear && taskDate.getMonth() === index;
          }).length;
          
          const habitCount = habits.filter(habit => {
            return habit.frequency.type === 'daily' || 
                   habit.frequency.type === 'weekly' || 
                   habit.frequency.type === 'monthly';
          }).length;
          
          const cardStyle = [
            dynamicStyles.monthCard,
            isSelected && dynamicStyles.selectedMonthCard,
            !isSelected && isCurrent && dynamicStyles.currentMonthCard,
          ].filter(Boolean);
          
          return (
            <TouchableOpacity
              key={index}
              style={cardStyle}
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(index);
                onDateChange(newDate);
              }}
            >
              <View style={dynamicStyles.monthHeader}>
                <Text style={dynamicStyles.monthName}>
                  {monthNames[index]}
                </Text>
                <Text style={dynamicStyles.activityCount}>
                  {activityCount} items
                </Text>
              </View>
              
              <View style={[
                dynamicStyles.activityIndicator,
                { backgroundColor: intensityColor }
              ]} />
              
              <View style={dynamicStyles.monthStats}>
                <View style={dynamicStyles.statItem}>
                  <Text style={dynamicStyles.statNumber}>{taskCount}</Text>
                  <Text style={dynamicStyles.statLabel}>Tasks</Text>
                </View>
                <View style={dynamicStyles.statItem}>
                  <Text style={dynamicStyles.statNumber}>{habitCount}</Text>
                  <Text style={dynamicStyles.statLabel}>Habits</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Legend */}
      <View style={dynamicStyles.legend}>
        <Text style={dynamicStyles.legendTitle}>Activity Level</Text>
        
        <View style={dynamicStyles.legendItem}>
          <View style={[
            dynamicStyles.legendColor,
            { backgroundColor: theme.colors.card }
          ]} />
          <Text style={dynamicStyles.legendText}>No activity</Text>
        </View>
        
        <View style={dynamicStyles.legendItem}>
          <View style={[
            dynamicStyles.legendColor,
            { backgroundColor: theme.colors_extended.success[theme.dark ? 'dark' : 'light'] + '40' }
          ]} />
          <Text style={dynamicStyles.legendText}>Light (1-5 items)</Text>
        </View>
        
        <View style={dynamicStyles.legendItem}>
          <View style={[
            dynamicStyles.legendColor,
            { backgroundColor: theme.colors_extended.success[theme.dark ? 'dark' : 'light'] + '70' }
          ]} />
          <Text style={dynamicStyles.legendText}>Moderate (6-15 items)</Text>
        </View>
        
        <View style={dynamicStyles.legendItem}>
          <View style={[
            dynamicStyles.legendColor,
            { backgroundColor: theme.colors_extended.success[theme.dark ? 'dark' : 'light'] }
          ]} />
          <Text style={dynamicStyles.legendText}>High (16+ items)</Text>
        </View>
      </View>
    </ScrollView>
  );
};
