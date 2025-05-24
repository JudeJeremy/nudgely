import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Habit } from '../../store/slices/habitSlice';
import { Card } from '../common/Card';

interface HabitItemProps {
  habit: Habit;
  onToggleComplete: (id: string, date: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onPress?: (habit: Habit) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  onToggleComplete,
  onDelete,
  onEdit,
  onPress,
}) => {
  const theme = useTheme();
  
  // Check if habit is completed for today
  const isCompletedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completions.some(
      (completion) => 
        completion.date.split('T')[0] === today && 
        completion.completed
    );
  };
  
  // Get frequency text
  const getFrequencyText = () => {
    if (habit.frequency.type === 'daily') {
      return 'Every day';
    } else if (habit.frequency.type === 'weekly') {
      if (habit.frequency.days && habit.frequency.days.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const days = habit.frequency.days.map(day => dayNames[day]).join(', ');
        return `Weekly: ${days}`;
      }
      return 'Weekly';
    } else {
      return 'Monthly';
    }
  };
  
  // Get time of day text
  const getTimeOfDayText = () => {
    if (!habit.frequency.times) return null;
    
    const times = [];
    if (habit.frequency.times.morning) times.push('Morning');
    if (habit.frequency.times.afternoon) times.push('Afternoon');
    if (habit.frequency.times.evening) times.push('Evening');
    
    if (times.length === 0) return null;
    return times.join(', ');
  };
  
  // Render right actions for swipeable (delete) - with fade animation
  const renderRightActions = (progress: Animated.AnimatedAddition<number>, dragX: Animated.AnimatedAddition<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 50, 100],
      extrapolate: 'clamp',
    });
    
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    return (
      <View style={styles.actionContainer}>
        <Animated.View
          style={[
            styles.rightAction,
            { 
              backgroundColor: theme.colors_extended.danger[theme.dark ? 'dark' : 'light'],
              borderRadius: theme.borderRadius.md,
              transform: [{ translateX: trans }, { scale }],
              opacity,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(habit.id)}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  // Render left actions for swipeable (edit) - with fade animation
  const renderLeftActions = (progress: Animated.AnimatedAddition<number>, dragX: Animated.AnimatedAddition<number>) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [-100, -50, 0],
      extrapolate: 'clamp',
    });
    
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    return (
      <View style={styles.actionContainer}>
        <Animated.View
          style={[
            styles.leftAction,
            { 
              backgroundColor: theme.colors_extended.info[theme.dark ? 'dark' : 'light'],
              borderRadius: theme.borderRadius.md,
              transform: [{ translateX: trans }, { scale }],
              opacity,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(habit)}
          >
            <Ionicons name="pencil-outline" size={20} color="white" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
      borderLeftColor: habit.color,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.8,
      marginTop: theme.spacing.xs,
    },
    metaContainer: {
      flexDirection: 'row',
      marginTop: theme.spacing.sm,
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    frequency: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.8,
      marginRight: theme.spacing.md,
    },
    timeOfDay: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.8,
      marginRight: theme.spacing.md,
    },
    category: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      backgroundColor: theme.colors_extended.categories[
        habit.category.toLowerCase() in theme.colors_extended.categories
          ? habit.category.toLowerCase() as keyof typeof theme.colors_extended.categories
          : 'other'
      ][theme.dark ? 'dark' : 'light'],
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    streakLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.8,
      marginRight: theme.spacing.xs,
    },
    streakValue: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: habit.color || theme.colors.primary,
      marginRight: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isCompletedToday() ? habit.color || theme.colors.primary : 'transparent',
    },
    checkboxInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'white',
    },
    contentContainer: {
      flex: 1,
    },
  });
  
  const handleToggle = () => {
    const today = new Date().toISOString();
    onToggleComplete(habit.id, today, !isCompletedToday());
  };
  
  const handlePress = () => {
    if (onPress) {
      onPress(habit);
    }
  };
  
  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={40}
      leftThreshold={40}
    >
      <Card 
        style={dynamicStyles.container}
        onPress={handlePress}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <TouchableOpacity
            style={dynamicStyles.checkbox}
            onPress={handleToggle}
          >
            {isCompletedToday() && <View style={dynamicStyles.checkboxInner} />}
          </TouchableOpacity>
          
          <View style={dynamicStyles.contentContainer}>
            <Text style={dynamicStyles.title}>{habit.title}</Text>
            
            {habit.description && (
              <Text style={dynamicStyles.description}>{habit.description}</Text>
            )}
            
            <View style={dynamicStyles.metaContainer}>
              <Text style={dynamicStyles.frequency}>
                {getFrequencyText()}
              </Text>
              
              {getTimeOfDayText() && (
                <Text style={dynamicStyles.timeOfDay}>
                  {getTimeOfDayText()}
                </Text>
              )}
              
              <Text style={dynamicStyles.category}>{habit.category}</Text>
            </View>
            
            <View style={dynamicStyles.streakContainer}>
              <Text style={dynamicStyles.streakLabel}>Current streak:</Text>
              <Text style={dynamicStyles.streakValue}>{habit.currentStreak} days</Text>
            </View>
          </View>
        </View>
      </Card>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
  },
});
