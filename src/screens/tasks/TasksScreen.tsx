import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import { Task, addTask, updateTask, deleteTask, toggleTaskCompletion } from '../../store/slices/taskSlice';
import { TaskItem } from '../../components/tasks/TaskItem';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/common/Header';

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
    starred: false,
    completed: false,
  });
  
  // State for date picker - simplified approach
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null); // Temporary date for iOS
  
  // State for filtering
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  
  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    // Filter by completion status
    if (!showCompleted && task.completed) return false;
    
    // Filter by category
    if (filterCategory && task.category !== filterCategory) return false;
    
    // Filter by starred status
    if (showStarredOnly && !task.starred) return false;
    
    return true;
  });
  
  // Sort tasks: starred first, then incomplete, then by due date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Starred tasks first
    if (a.starred !== b.starred) {
      return a.starred ? -1 : 1;
    }
    
    // Incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
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
    setSelectedDate(task.dueDate ? new Date(task.dueDate) : null);
    setIsEditing(true);
    setIsModalVisible(true);
  };
  
  // Handle form submission
  const handleSubmitTask = () => {
    if (!currentTask.title) return; // Don't submit if title is empty
    
    const taskData = {
      ...currentTask,
      dueDate: selectedDate ? selectedDate.toISOString() : undefined,
    };
    
    if (isEditing && currentTask.id) {
      dispatch(updateTask(taskData as Task));
    } else {
      dispatch(
        addTask({
          title: currentTask.title,
          description: currentTask.description || '',
          category: currentTask.category || 'Personal',
          starred: false,
          completed: false,
          dueDate: selectedDate ? selectedDate.toISOString() : undefined,
        })
      );
    }
    
    // Reset form and close modal
    resetForm();
  };
  
  // Reset form helper
  const resetForm = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setSelectedDate(null);
    setTempDate(null);
    setShowDatePicker(false);
    setCurrentTask({
      title: '',
      description: '',
      category: 'Personal',
      starred: false,
      completed: false,
    });
  };
  
  // Handle adding a new task
  const handleAddTask = () => {
    setIsEditing(false);
    setSelectedDate(null);
    setTempDate(null);
    setCurrentTask({
      title: '',
      description: '',
      category: 'Personal',
      starred: false,
      completed: false,
    });
    setIsModalVisible(true);
  };
  
  // Handle canceling the form
  const handleCancelForm = () => {
    resetForm();
  };
  
  // Handle date picker change - Simplified for better iOS support
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
      }
      return;
    }
    
    // iOS handling
    if (date) {
      setTempDate(date);
    }
  };
  
  // Handle date picker button press
  const handleDatePickerPress = () => {
    // Close task modal temporarily on iOS to avoid nested modals
    if (Platform.OS === 'ios') {
      setIsModalVisible(false);
    }
    setTempDate(selectedDate || new Date());
    setShowDatePicker(true);
  };
  
  // Handle iOS date picker done
  const handleDatePickerDone = () => {
    if (tempDate) {
      setSelectedDate(tempDate);
    }
    setShowDatePicker(false);
    setTempDate(null);
    // Reopen task modal on iOS
    if (Platform.OS === 'ios') {
      setIsModalVisible(true);
    }
  };
  
  // Handle iOS date picker cancel
  const handleDatePickerCancel = () => {
    setShowDatePicker(false);
    setTempDate(null);
    // Reopen task modal on iOS
    if (Platform.OS === 'ios') {
      setIsModalVisible(true);
    }
  };
  
  // Handle clear date
  const handleClearDate = () => {
    setSelectedDate(null);
    setTempDate(null);
  };
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
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
    datePickerContainer: {
      marginBottom: theme.spacing.md,
    },
    datePickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.background,
    },
    datePickerText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
    },
    datePickerPlaceholder: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      opacity: 0.5,
    },
    clearDateButton: {
      padding: theme.spacing.xs,
    },
    datePickerModal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    datePickerModalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      margin: theme.spacing.lg,
      minWidth: 300,
      ...theme.shadows.lg,
    },
    datePickerModalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg,
    },
  });
  
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Header 
        title="Tasks" 
        subtitle={`${tasks.length} total tasks`}
        rightComponent={
          <TouchableOpacity onPress={handleAddTask}>
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
        {/* Starred filter */}
        <TouchableOpacity
          style={[
            dynamicStyles.filterButton,
            showStarredOnly && dynamicStyles.filterButtonActive,
          ]}
          onPress={() => setShowStarredOnly(!showStarredOnly)}
        >
          <Text
            style={[
              dynamicStyles.filterButtonText,
              showStarredOnly && dynamicStyles.filterButtonTextActive,
            ]}
          >
            Starred Only
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
        visible={isModalVisible && !showDatePicker}
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
            
            {/* Due Date Picker */}
            <View style={dynamicStyles.datePickerContainer}>
              <Text style={{ marginBottom: theme.spacing.xs, color: theme.colors.text }}>
                Due Date (optional)
              </Text>
              <TouchableOpacity
                style={dynamicStyles.datePickerButton}
                onPress={handleDatePickerPress}
              >
                <Text style={selectedDate ? dynamicStyles.datePickerText : dynamicStyles.datePickerPlaceholder}>
                  {selectedDate ? selectedDate.toLocaleDateString() : 'Select due date'}
                </Text>
                {selectedDate && (
                  <TouchableOpacity
                    style={dynamicStyles.clearDateButton}
                    onPress={handleClearDate}
                  >
                    <Text style={{ color: theme.colors.primary }}>Clear</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
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
      
      {/* Date Picker Modal - Separate from task modal to avoid nesting issues */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={handleDatePickerCancel}
        >
          <View style={dynamicStyles.datePickerModal}>
            <View style={dynamicStyles.datePickerModalContent}>
              <Text style={[dynamicStyles.modalTitle, { textAlign: 'center', marginBottom: theme.spacing.lg }]}>
                Select Due Date
              </Text>
              
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={tempDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  style={{ height: 200 }}
                />
              ) : (
                <DateTimePicker
                  value={tempDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              
              <View style={dynamicStyles.datePickerModalButtons}>
                <Button
                  title="Cancel"
                  onPress={handleDatePickerCancel}
                  variant="outline"
                />
                <Button
                  title="Done"
                  onPress={handleDatePickerDone}
                  variant="primary"
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
      </View>
    </View>
  );
};
