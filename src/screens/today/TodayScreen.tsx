import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import { Task, toggleTaskCompletion, toggleTaskStar } from '../../store/slices/taskSlice';
import { Habit, completeHabit } from '../../store/slices/habitSlice';
import { Card } from '../../components/common/Card';
import { ExpandableViewSwitcher, ViewMode } from '../../components/today/ExpandableViewSwitcher';
import { MonthYearPicker } from '../../components/today/MonthYearPicker';
import { WeekView } from '../../components/today/WeekView';
import { MonthlyCalendarView } from '../../components/today/MonthlyCalendarView';
import { YearlyOverview } from '../../components/today/YearlyOverview';

interface TodayItem {
  id: string;
  type: 'task' | 'habit';
  title: string;
  description?: string;
  completed: boolean;
  starred?: boolean;
  dueDate?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  color?: string;
  category: string;
  streak?: number;
}

export const TodayScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const habits = useAppSelector((state) => state.habits.habits);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedItem, setSelectedItem] = useState<TodayItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showQuickDateActions, setShowQuickDateActions] = useState(false);
  
  // Generate time slots for daily view
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };
  
  // Check if habit is scheduled for the selected date
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
  
  // Check if habit is completed for the selected date
  const isHabitCompletedForDate = (habit: Habit, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return habit.completions.some(
      (completion) => 
        completion.date.split('T')[0] === dateString && 
        completion.completed
    );
  };
  
  // Helper function to convert time string to minutes for comparison
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return -1;
    
    // Handle both 24-hour format (HH:MM) and 12-hour format (HH:MM AM/PM)
    let cleanTime = timeStr.trim().toLowerCase();
    let hours = 0;
    let minutes = 0;
    
    if (cleanTime.includes('am') || cleanTime.includes('pm')) {
      // 12-hour format
      const isPM = cleanTime.includes('pm');
      cleanTime = cleanTime.replace(/[ap]m/g, '').trim();
      const [hourStr, minuteStr] = cleanTime.split(':');
      hours = parseInt(hourStr, 10);
      minutes = parseInt(minuteStr || '0', 10);
      
      if (isPM && hours !== 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0;
      }
    } else {
      // 24-hour format
      const [hourStr, minuteStr] = cleanTime.split(':');
      hours = parseInt(hourStr, 10);
      minutes = parseInt(minuteStr || '0', 10);
    }
    
    return hours * 60 + minutes;
  };
  
  // Helper function to check if a task/habit time falls within a time slot
  const isTimeInSlot = (itemTime: string, slotTime: string): boolean => {
    const itemMinutes = timeToMinutes(itemTime);
    const slotMinutes = timeToMinutes(slotTime);
    
    if (itemMinutes === -1 || slotMinutes === -1) return false;
    
    // Check if the item time falls within this hour slot (e.g., 10:28 PM falls in 22:00 slot)
    return itemMinutes >= slotMinutes && itemMinutes < slotMinutes + 60;
  };
  
  // Get items for a specific time slot
  const getItemsForTimeSlot = (timeSlot: string): TodayItem[] => {
    const items: TodayItem[] = [];
    
    // Normalize the selected date to compare with task dates
    const selectedDateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // Add tasks for this time slot
    tasks.forEach((task) => {
      if (task.dueDate && !task.isAllDay && task.startTime) {
        // Normalize task date for comparison
        const taskDate = new Date(task.dueDate);
        const taskDateStr = taskDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        
        // Check if task is on the selected date and time falls within this slot
        if (taskDateStr === selectedDateStr && isTimeInSlot(task.startTime, timeSlot)) {
          items.push({
            id: task.id,
            type: 'task',
            title: task.title,
            description: task.description,
            completed: task.completed,
            starred: task.starred,
            dueDate: task.dueDate,
            startTime: task.startTime,
            endTime: task.endTime,
            isAllDay: task.isAllDay,
            category: task.category,
          });
        }
      }
    });
    
    // Add habits for this time slot
    habits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, selectedDate) && !habit.isAllDay && habit.startTime) {
        if (isTimeInSlot(habit.startTime, timeSlot)) {
          items.push({
            id: habit.id,
            type: 'habit',
            title: habit.title,
            description: habit.description,
            completed: isHabitCompletedForDate(habit, selectedDate),
            color: habit.color,
            startTime: habit.startTime,
            endTime: habit.endTime,
            isAllDay: habit.isAllDay,
            category: habit.category,
            streak: habit.currentStreak,
          });
        }
      }
    });
    
    return items.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Get all-day items
  const getAllDayItems = (): TodayItem[] => {
    const items: TodayItem[] = [];
    
    // Normalize the selected date to compare with task dates
    const selectedDateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // Add all-day tasks
    tasks.forEach((task) => {
      if (task.dueDate && (task.isAllDay || !task.startTime)) {
        // Normalize task date for comparison
        const taskDate = new Date(task.dueDate);
        const taskDateStr = taskDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        
        if (taskDateStr === selectedDateStr) {
          items.push({
            id: task.id,
            type: 'task',
            title: task.title,
            description: task.description,
            completed: task.completed,
            starred: task.starred,
            dueDate: task.dueDate,
            isAllDay: true,
            category: task.category,
          });
        }
      }
    });
    
    // Add all-day habits
    habits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, selectedDate) && (habit.isAllDay || !habit.startTime)) {
        items.push({
          id: habit.id,
          type: 'habit',
          title: habit.title,
          description: habit.description,
          completed: isHabitCompletedForDate(habit, selectedDate),
          color: habit.color,
          isAllDay: true,
          category: habit.category,
          streak: habit.currentStreak,
        });
      }
    });
    
    return items.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return 0;
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
  
  // Handle item press for details
  const handleItemPress = (item: TodayItem) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };
  
  // Handle settings button press
  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };
  
  // Handle calendar button press (show quick date actions)
  const handleCalendarPress = () => {
    setShowQuickDateActions(true);
  };
  
  // Quick date action handlers
  const handleQuickDateAction = (action: string) => {
    const today = new Date();
    const currentDate = new Date(selectedDate);
    
    switch (action) {
      case 'today':
        setSelectedDate(new Date(today));
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        setSelectedDate(tomorrow);
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        setSelectedDate(yesterday);
        break;
      case 'nextWeek':
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7);
        setSelectedDate(nextWeek);
        break;
      case 'previousWeek':
        const previousWeek = new Date(currentDate);
        previousWeek.setDate(currentDate.getDate() - 7);
        setSelectedDate(previousWeek);
        break;
    }
    
    setShowQuickDateActions(false);
  };
  
  // Format time range
  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime) return '';
    if (!endTime) return startTime;
    return `${startTime} - ${endTime}`;
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
    floatingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rightControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
    contentContainer: {
      flex: 1,
      padding: theme.spacing.md,
    },
    allDaySection: {
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      shadowColor: theme.shadows.sm.shadowColor,
      shadowOffset: theme.shadows.sm.shadowOffset,
      shadowOpacity: theme.shadows.sm.shadowOpacity,
      shadowRadius: theme.shadows.sm.shadowRadius,
      elevation: theme.shadows.sm.elevation,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    allDayGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    allDayItem: {
      flex: 1,
      minWidth: '45%',
      maxWidth: '48%',
    },
    timeSlotContainer: {
      marginBottom: theme.spacing.md,
    },
    timeSlotHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    timeText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
      opacity: 0.7,
      width: 60,
      paddingTop: theme.spacing.xs,
    },
    timeSlotContent: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    itemContainer: {
      marginBottom: theme.spacing.xs,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderLeftWidth: 4,
      borderRadius: theme.borderRadius.sm,
      shadowColor: theme.shadows.sm.shadowColor,
      shadowOffset: theme.shadows.sm.shadowOffset,
      shadowOpacity: theme.shadows.sm.shadowOpacity,
      shadowRadius: theme.shadows.sm.shadowRadius,
      elevation: theme.shadows.sm.elevation,
    },
    allDayItemCard: {
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 2,
      borderColor: 'transparent',
      minHeight: 80,
      shadowColor: theme.shadows.sm.shadowColor,
      shadowOffset: theme.shadows.sm.shadowOffset,
      shadowOpacity: theme.shadows.sm.shadowOpacity,
      shadowRadius: theme.shadows.sm.shadowRadius,
      elevation: theme.shadows.sm.elevation,
    },
    allDayItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: 'white',
    },
    itemDetails: {
      flex: 1,
    },
    itemTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text,
    },
    allDayItemTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    itemTime: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.6,
      marginTop: 2,
    },
    itemCategory: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.7,
      fontWeight: '500',
    },
    starButton: {
      padding: theme.spacing.xs,
      marginLeft: theme.spacing.sm,
    },
    emptyTimeSlot: {
      padding: theme.spacing.sm,
      alignItems: 'center',
      opacity: 0.5,
    },
    emptyText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      opacity: 0.5,
    },
    emptyAllDay: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      opacity: 0.5,
    },
    emptyAllDayText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      opacity: 0.5,
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '90%',
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    modalBody: {
      marginBottom: theme.spacing.md,
    },
    modalText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    // Quick Date Actions Modal styles
    quickDateActionsModal: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      width: '70%',
      maxWidth: 300,
    },
    quickDateActionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    quickDateActionIcon: {
      marginRight: theme.spacing.md,
      width: 24,
      alignItems: 'center',
    },
    quickDateActionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      fontWeight: '500',
    },
  });
  
  const renderItem = (item: TodayItem, showTime: boolean = false, isAllDay: boolean = false) => {
    const borderColor = item.type === 'habit' ? (item.color || theme.colors.primary) : getCategoryColor(item.category);
    const checkboxColor = item.type === 'habit' ? (item.color || theme.colors.primary) : theme.colors.primary;
    
    if (isAllDay) {
      return (
        <TouchableOpacity
          key={item.id}
          style={dynamicStyles.allDayItem}
          onPress={() => handleItemPress(item)}
        >
          <Card style={{...dynamicStyles.allDayItemCard, borderColor: borderColor}}>
            <View style={dynamicStyles.allDayItemHeader}>
              <TouchableOpacity
                style={[
                  dynamicStyles.checkbox,
                  {
                    borderColor: checkboxColor,
                    backgroundColor: item.completed ? checkboxColor : 'transparent',
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
              
              {item.type === 'task' && (
                <TouchableOpacity
                  style={dynamicStyles.starButton}
                  onPress={() => handleTaskStar(item.id)}
                >
                  <Ionicons
                    name={item.starred ? 'star' : 'star-outline'}
                    size={16}
                    color={item.starred ? theme.colors_extended.warning[theme.dark ? 'dark' : 'light'] : theme.colors.text}
                  />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={[
              dynamicStyles.allDayItemTitle,
              { textDecorationLine: item.completed ? 'line-through' : 'none' }
            ]}>
              {item.title}
            </Text>
            
            <Text style={dynamicStyles.itemCategory}>
              {item.category}
            </Text>
          </Card>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        key={item.id}
        style={dynamicStyles.itemContainer}
        onPress={() => handleItemPress(item)}
      >
        <Card style={{...dynamicStyles.itemCard, borderLeftColor: borderColor}}>
          <TouchableOpacity
            style={[
              dynamicStyles.checkbox,
              {
                borderColor: checkboxColor,
                backgroundColor: item.completed ? checkboxColor : 'transparent',
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
            
            {showTime && (
              <Text style={dynamicStyles.itemTime}>
                {formatTimeRange(item.startTime, item.endTime)}
              </Text>
            )}
          </View>
          
          {item.type === 'task' && (
            <TouchableOpacity
              style={dynamicStyles.starButton}
              onPress={() => handleTaskStar(item.id)}
            >
              <Ionicons
                name={item.starred ? 'star' : 'star-outline'}
                size={16}
                color={item.starred ? theme.colors_extended.warning[theme.dark ? 'dark' : 'light'] : theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </Card>
      </TouchableOpacity>
    );
  };
  
  const renderDailyView = () => {
    const timeSlots = generateTimeSlots();
    const allDayItems = getAllDayItems();
    
    return (
      <ScrollView style={dynamicStyles.contentContainer}>
        {/* All Day Section */}
        <View style={dynamicStyles.allDaySection}>
          <Text style={dynamicStyles.sectionTitle}>All Day</Text>
          {allDayItems.length > 0 ? (
            <View style={dynamicStyles.allDayGrid}>
              {allDayItems.map((item) => renderItem(item, false, true))}
            </View>
          ) : (
            <View style={dynamicStyles.emptyAllDay}>
              <Text style={dynamicStyles.emptyAllDayText}>
                No all-day tasks or habits for today
              </Text>
            </View>
          )}
        </View>
        
        {/* Time Slots */}
        {timeSlots.map((timeSlot) => {
          const items = getItemsForTimeSlot(timeSlot);
          
          return (
            <View key={timeSlot} style={dynamicStyles.timeSlotContainer}>
              <View style={dynamicStyles.timeSlotHeader}>
                <Text style={dynamicStyles.timeText}>{timeSlot}</Text>
                <View style={dynamicStyles.timeSlotContent}>
                  {items.length > 0 ? (
                    items.map((item) => renderItem(item, true))
                  ) : (
                    <View style={dynamicStyles.emptyTimeSlot}>
                      <Text style={dynamicStyles.emptyText}>No items scheduled</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };
  
  const renderContent = () => {
    switch (viewMode) {
      case 'daily':
        return renderDailyView();
      case 'monthly':
        return (
          <MonthlyCalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            tasks={tasks}
            habits={habits}
          />
        );
      case 'yearly':
        return (
          <YearlyOverview
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            tasks={tasks}
            habits={habits}
          />
        );
      default:
        return renderDailyView();
    }
  };
  
  return (
    <View style={dynamicStyles.container}>
      {/* Floating Header */}
      <View style={dynamicStyles.floatingHeader}>
        <ExpandableViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
        
        <View style={dynamicStyles.rightControls}>
          <MonthYearPicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          <TouchableOpacity style={dynamicStyles.iconButton} onPress={handleCalendarPress}>
            <Ionicons name="calendar" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.iconButton} onPress={handleSettingsPress}>
            <Ionicons name="settings" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Week View (only for daily mode) */}
      {viewMode === 'daily' && (
        <WeekView
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          tasks={tasks}
          habits={habits}
        />
      )}
      
      {/* Main Content */}
      {renderContent()}
      
      {/* Item Detail Modal */}
      <Modal
        visible={showItemDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setShowItemDetail(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowItemDetail(false)}
        >
          <TouchableOpacity
            style={dynamicStyles.modalContent}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>
                {selectedItem?.title}
              </Text>
              <TouchableOpacity
                style={dynamicStyles.closeButton}
                onPress={() => setShowItemDetail(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={dynamicStyles.modalBody}>
              {selectedItem?.description && (
                <Text style={dynamicStyles.modalText}>
                  {selectedItem.description}
                </Text>
              )}
              
              <Text style={dynamicStyles.modalText}>
                Category: {selectedItem?.category}
              </Text>
              
              {selectedItem?.startTime && (
                <Text style={dynamicStyles.modalText}>
                  Time: {formatTimeRange(selectedItem.startTime, selectedItem.endTime)}
                </Text>
              )}
              
              {selectedItem?.type === 'habit' && selectedItem.streak !== undefined && (
                <Text style={dynamicStyles.modalText}>
                  Current Streak: {selectedItem.streak} days
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Quick Date Actions Modal */}
      <Modal
        visible={showQuickDateActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickDateActions(false)}
      >
        <TouchableOpacity
          style={dynamicStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQuickDateActions(false)}
        >
          <TouchableOpacity
            style={dynamicStyles.quickDateActionsModal}
            activeOpacity={1}
            onPress={() => {}}
          >
            <TouchableOpacity
              style={dynamicStyles.quickDateActionItem}
              onPress={() => handleQuickDateAction('today')}
            >
              <View style={dynamicStyles.quickDateActionIcon}>
                <Ionicons name="today" size={20} color={theme.colors.primary} />
              </View>
              <Text style={dynamicStyles.quickDateActionText}>Go to Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={dynamicStyles.quickDateActionItem}
              onPress={() => handleQuickDateAction('tomorrow')}
            >
              <View style={dynamicStyles.quickDateActionIcon}>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.text} />
              </View>
              <Text style={dynamicStyles.quickDateActionText}>Go to Tomorrow</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={dynamicStyles.quickDateActionItem}
              onPress={() => handleQuickDateAction('yesterday')}
            >
              <View style={dynamicStyles.quickDateActionIcon}>
                <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
              </View>
              <Text style={dynamicStyles.quickDateActionText}>Go to Yesterday</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={dynamicStyles.quickDateActionItem}
              onPress={() => handleQuickDateAction('nextWeek')}
            >
              <View style={dynamicStyles.quickDateActionIcon}>
                <Ionicons name="play-forward" size={20} color={theme.colors.text} />
              </View>
              <Text style={dynamicStyles.quickDateActionText}>Next Week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={dynamicStyles.quickDateActionItem}
              onPress={() => handleQuickDateAction('previousWeek')}
            >
              <View style={dynamicStyles.quickDateActionIcon}>
                <Ionicons name="play-back" size={20} color={theme.colors.text} />
              </View>
              <Text style={dynamicStyles.quickDateActionText}>Previous Week</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
