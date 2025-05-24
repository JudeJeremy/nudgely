import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import { Task, addTask, updateTask, deleteTask, toggleTaskCompletion } from '../../store/slices/taskSlice';
import { TaskItem } from '../../components/tasks/TaskItem';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { Card } from '../../components/common/Card';

export const TasksScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const categories = useAppSelector((state) => state.tasks.categories);
  
  // State for task form
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'Personal',
    priority: 'medium',
    completed: false,
  });
  
  // State for filtering
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<'low' | 'medium' | 'high' | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    // Filter by completion status
    if (!showCompleted && task.completed) return false;
    
    // Filter by category
    if (filterCategory && task.category !== filterCategory) return false;
    
    // Filter by priority
    if (filterPriority && task.priority !== filterPriority) return false;
    
    return true;
  });
  
  // Sort tasks: incomplete first, then by priority, then by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Sort by due date if available
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Tasks with due dates come before tasks without due dates
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Finally, sort by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Handle task toggle
  const handleToggleComplete = (id: string) => {
    dispatch(toggleTaskCompletion(id));
  };
  
  // Handle task deletion
  const handleDeleteTask = (id: string) => {
    dispatch(deleteTask(id));
  };
  
  // Handle task edit
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditing(true);
    setIsModalVisible(true);
  };
  
  // Handle form submission
  const handleSubmitTask = () => {
    if (!currentTask.title) return; // Don't submit if title is empty
    
    if (isEditing && currentTask.id) {
      dispatch(updateTask(currentTask as Task));
    } else {
      dispatch(
        addTask({
          title: currentTask.title,
          description: currentTask.description || '',
          category: currentTask.category || 'Personal',
          priority: (currentTask.priority as 'low' | 'medium' | 'high') || 'medium',
          completed: false,
          dueDate: currentTask.dueDate,
        })
      );
    }
    
    // Reset form and close modal
    setIsModalVisible(false);
    setIsEditing(false);
    setCurrentTask({
      title: '',
      description: '',
      category: 'Personal',
      priority: 'medium',
      completed: false,
    });
  };
  
  // Handle adding a new task
  const handleAddTask = () => {
    setIsEditing(false);
    setCurrentTask({
      title: '',
      description: '',
      category: 'Personal',
      priority: 'medium',
      completed: false,
    });
    setIsModalVisible(true);
  };
  
  // Handle canceling the form
  const handleCancelForm = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setCurrentTask({
      title: '',
      description: '',
      category: 'Personal',
      priority: 'medium',
      completed: false,
    });
  };
  
  // Handle changing due date
  const handleDueDateChange = (date: Date | null) => {
    if (date) {
      setCurrentTask({ ...currentTask, dueDate: date.toISOString() });
    } else {
      const { dueDate, ...rest } = currentTask;
      setCurrentTask(rest);
    }
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
    priorityButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    priorityButtonActive: {
      borderWidth: 0,
    },
    priorityButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
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
  });
  
  // Render priority button
  const renderPriorityButton = (priority: 'low' | 'medium' | 'high', label: string) => {
    const isActive = currentTask.priority === priority;
    let backgroundColor;
    
    switch (priority) {
      case 'high':
        backgroundColor = theme.colors_extended.danger[theme.dark ? 'dark' : 'light'];
        break;
      case 'medium':
        backgroundColor = theme.colors_extended.warning[theme.dark ? 'dark' : 'light'];
        break;
      case 'low':
        backgroundColor = theme.colors_extended.success[theme.dark ? 'dark' : 'light'];
        break;
    }
    
    return (
      <TouchableOpacity
        style={[
          dynamicStyles.priorityButton,
          isActive && dynamicStyles.priorityButtonActive,
          isActive && { backgroundColor },
        ]}
        onPress={() => setCurrentTask({ ...currentTask, priority })}
      >
        <Text
          style={[
            dynamicStyles.priorityButtonText,
            { color: isActive ? 'white' : theme.colors.text },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <View style={dynamicStyles.emptyContainer}>
      <Text style={dynamicStyles.emptyText}>
        No tasks found. Add a new task to get started!
      </Text>
      <Button title="Add Task" onPress={handleAddTask} variant="primary" />
    </View>
  );
  
  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Tasks</Text>
      </View>
      
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
            All
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
        {/* Priority filters */}
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterPriority === null && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority(null)}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterPriority === null && dynamicStyles.filterButtonTextActive,
            ]}
          >
            All Priorities
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterPriority === 'high' && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority(filterPriority === 'high' ? null : 'high')}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterPriority === 'high' && dynamicStyles.filterButtonTextActive,
            ]}
          >
            High
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterPriority === 'medium' && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority(filterPriority === 'medium' ? null : 'medium')}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterPriority === 'medium' && dynamicStyles.filterButtonTextActive,
            ]}
          >
            Medium
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            filterPriority === 'low' && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setFilterPriority(filterPriority === 'low' ? null : 'low')}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              filterPriority === 'low' && dynamicStyles.filterButtonTextActive,
            ]}
          >
            Low
          </Text>
        </TouchableOpacity>
        
        {/* Show/Hide completed */}
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            !showCompleted && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              !showCompleted && dynamicStyles.filterButtonTextActive,
            ]}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Task List */}
      {sortedTasks.length > 0 ? (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyState()
      )}
      
      {/* Add Task FAB */}
      <TouchableOpacity style={dynamicStyles.fab} onPress={handleAddTask}>
        <Text style={dynamicStyles.fabText}>+</Text>
      </TouchableOpacity>
      
      {/* Task Form Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelForm}
      >
        <View style={dynamicStyles.modalContainer}>
          <Card style={dynamicStyles.modalContent} elevation="large">
            <Text style={dynamicStyles.modalTitle}>
              {isEditing ? 'Edit Task' : 'Add New Task'}
            </Text>
            
            <TextInput
              label="Title"
              value={currentTask.title}
              onChangeText={(text) => setCurrentTask({ ...currentTask, title: text })}
              placeholder="Enter task title"
            />
            
            <TextInput
              label="Description (optional)"
              value={currentTask.description}
              onChangeText={(text) => setCurrentTask({ ...currentTask, description: text })}
              placeholder="Enter task description"
              multiline
              numberOfLines={3}
            />
            
            <Text style={{ marginBottom: theme.spacing.xs, color: theme.colors.text }}>
              Priority
            </Text>
            <View style={dynamicStyles.formRow}>
              {renderPriorityButton('low', 'Low')}
              {renderPriorityButton('medium', 'Medium')}
              {renderPriorityButton('high', 'High')}
            </View>
            
            <Text style={{ marginBottom: theme.spacing.xs, color: theme.colors.text }}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    dynamicStyles.categoryButton,
                    currentTask.category === category && dynamicStyles.categoryButtonActive,
                  ]}
                  onPress={() => setCurrentTask({ ...currentTask, category })}
                >
                  <Text
                    style={[
                      dynamicStyles.categoryButtonText,
                      currentTask.category === category && dynamicStyles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
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
                onPress={handleSubmitTask}
                variant="primary"
                disabled={!currentTask.title}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
};
