import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../store';
import { Task, toggleTaskStar } from '../../store/slices/taskSlice';
import { Card } from '../common/Card';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
}) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Format the due date if it exists
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if the date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise, return the formatted date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get category color
  const getCategoryColor = () => {
    // Map category to a color
    switch (task.category.toLowerCase()) {
      case 'personal':
        return theme.colors_extended.categories.personal[theme.dark ? 'dark' : 'light'];
      case 'work':
        return theme.colors_extended.categories.work[theme.dark ? 'dark' : 'light'];
      case 'health':
        return theme.colors_extended.categories.health[theme.dark ? 'dark' : 'light'];
      case 'shopping':
        return theme.colors_extended.categories.shopping[theme.dark ? 'dark' : 'light'];
      default:
        return theme.colors_extended.categories.other[theme.dark ? 'dark' : 'light'];
    }
  };
  
  // Handle star toggle
  const handleStarToggle = () => {
    dispatch(toggleTaskStar(task.id));
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
            onPress={() => onDelete(task.id)}
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
            onPress={() => onEdit(task)}
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
      opacity: task.completed ? 0.7 : 1,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text,
      textDecorationLine: task.completed ? 'line-through' : 'none',
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.8,
      marginTop: theme.spacing.xs,
      textDecorationLine: task.completed ? 'line-through' : 'none',
    },
    metaContainer: {
      flexDirection: 'row',
      marginTop: theme.spacing.sm,
      alignItems: 'center',
    },
    dueDate: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.8,
      marginRight: theme.spacing.md,
    },
    category: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      backgroundColor: getCategoryColor(),
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      overflow: 'hidden',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      marginRight: theme.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: task.completed ? theme.colors.primary : 'transparent',
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
    starButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
  });
  
  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      rightThreshold={40}
      leftThreshold={40}
    >
      <Card style={dynamicStyles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <TouchableOpacity
            style={dynamicStyles.checkbox}
            onPress={() => onToggleComplete(task.id)}
          >
            {task.completed && <View style={dynamicStyles.checkboxInner} />}
          </TouchableOpacity>
          
          <View style={dynamicStyles.contentContainer}>
            <Text style={dynamicStyles.title}>{task.title}</Text>
            
            {task.description && (
              <Text style={dynamicStyles.description}>{task.description}</Text>
            )}
            
            <View style={dynamicStyles.metaContainer}>
              {task.dueDate && (
                <Text style={dynamicStyles.dueDate}>
                  {formatDueDate(task.dueDate)}
                </Text>
              )}
              
              <Text style={dynamicStyles.category}>{task.category}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={dynamicStyles.starButton}
            onPress={handleStarToggle}
          >
            <Ionicons
              name={task.starred ? 'star' : 'star-outline'}
              size={20}
              color={task.starred ? theme.colors_extended.warning[theme.dark ? 'dark' : 'light'] : theme.colors.text}
            />
          </TouchableOpacity>
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
