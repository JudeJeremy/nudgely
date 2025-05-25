import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { Task } from '../store/slices/taskSlice';
import { Habit } from '../store/slices/habitSlice';

/**
 * Request calendar permissions
 * @returns Whether permissions were granted
 */
export const requestCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
};

/**
 * Get or create a Nudgely calendar
 * @returns Calendar ID or null if failed
 */
export const getOrCreateNudgelyCalendar = async (): Promise<string | null> => {
  try {
    // Get all calendars
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Look for existing Nudgely calendar
    const existingCalendar = calendars.find(cal => cal.title === 'Nudgely');
    if (existingCalendar) {
      console.log('Found existing Nudgely calendar:', existingCalendar.id);
      return existingCalendar.id;
    }
    
    // Try to create new Nudgely calendar
    let calendarId: string | null = null;
    
    if (Platform.OS === 'ios') {
      calendarId = await createiOSCalendar();
    } else {
      calendarId = await createAndroidCalendar();
    }
    
    // If calendar creation failed, fallback to using default calendar
    if (!calendarId) {
      console.log('Calendar creation failed, falling back to default calendar');
      const defaultCalendar = await getDefaultCalendar();
      return defaultCalendar;
    }
    
    return calendarId;
  } catch (error) {
    console.error('Error in getOrCreateNudgelyCalendar:', error);
    
    // Final fallback: try to use any available calendar
    try {
      const defaultCalendar = await getDefaultCalendar();
      console.log('Using fallback default calendar:', defaultCalendar);
      return defaultCalendar;
    } catch (fallbackError) {
      console.error('Fallback calendar selection also failed:', fallbackError);
      return null;
    }
  }
};

/**
 * Create calendar on iOS with improved source handling
 */
const createiOSCalendar = async (): Promise<string | null> => {
  try {
    const sources = await Calendar.getSourcesAsync();
    console.log('Available iOS calendar sources:', sources.map(s => ({ name: s.name, type: s.type })));
    
    // Try different source selection strategies
    let calendarSource = null;
    
    // Strategy 1: Find iCloud source
    calendarSource = sources.find(source => 
      source.name === 'iCloud' || 
      source.type === Calendar.SourceType.CALDAV
    );
    
    // Strategy 2: Find Default source
    if (!calendarSource) {
      calendarSource = sources.find(source => source.name === 'Default');
    }
    
    // Strategy 3: Find Local source
    if (!calendarSource) {
      calendarSource = sources.find(source => source.type === Calendar.SourceType.LOCAL);
    }
    
    // Strategy 4: Use first available source
    if (!calendarSource && sources.length > 0) {
      calendarSource = sources[0];
    }
    
    if (!calendarSource) {
      console.error('No suitable calendar source found');
      return null;
    }
    
    console.log('Using calendar source:', { name: calendarSource.name, type: calendarSource.type });
    
    const calendarId = await Calendar.createCalendarAsync({
      title: 'Nudgely',
      color: '#0a7ea4',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: calendarSource.id,
      source: calendarSource,
      name: 'Nudgely',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    
    console.log('Successfully created iOS calendar:', calendarId);
    return calendarId;
  } catch (error) {
    console.error('Error creating iOS calendar:', error);
    return null;
  }
};

/**
 * Create calendar on Android
 */
const createAndroidCalendar = async (): Promise<string | null> => {
  try {
    const calendarId = await Calendar.createCalendarAsync({
      title: 'Nudgely',
      color: '#0a7ea4',
      entityType: Calendar.EntityTypes.EVENT,
      name: 'Nudgely',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    
    console.log('Successfully created Android calendar:', calendarId);
    return calendarId;
  } catch (error) {
    console.error('Error creating Android calendar:', error);
    return null;
  }
};

/**
 * Get default calendar as fallback
 */
const getDefaultCalendar = async (): Promise<string | null> => {
  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Find the primary calendar
    const primaryCalendar = calendars.find(cal => cal.isPrimary);
    if (primaryCalendar) {
      console.log('Using primary calendar:', primaryCalendar.title);
      return primaryCalendar.id;
    }
    
    // Find a writable calendar
    const writableCalendar = calendars.find(cal => 
      cal.accessLevel === Calendar.CalendarAccessLevel.OWNER ||
      cal.accessLevel === Calendar.CalendarAccessLevel.CONTRIBUTOR
    );
    if (writableCalendar) {
      console.log('Using writable calendar:', writableCalendar.title);
      return writableCalendar.id;
    }
    
    // Use first available calendar
    if (calendars.length > 0) {
      console.log('Using first available calendar:', calendars[0].title);
      return calendars[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting default calendar:', error);
    return null;
  }
};

/**
 * Create a calendar event for a task
 * @param task Task to create event for
 * @param calendarId Calendar ID to create event in
 * @returns Event ID or null if failed
 */
export const createTaskEvent = async (
  task: Task,
  calendarId: string
): Promise<string | null> => {
  try {
    if (!task.dueDate) {
      console.warn('Task has no due date, skipping calendar event creation');
      return null;
    }
    
    const dueDate = new Date(task.dueDate);
    const startDate = new Date(dueDate.getTime() - 30 * 60000); // 30 minutes before due date
    
    const eventId = await Calendar.createEventAsync(calendarId, {
      title: `📋 ${task.title}`,
      notes: task.description || 'Task from Nudgely app',
      startDate,
      endDate: dueDate,
      allDay: false,
      alarms: [
        { relativeOffset: -15 }, // 15 minutes before
        { relativeOffset: -5 },  // 5 minutes before
      ],
    });
    
    return eventId;
  } catch (error) {
    console.error('Error creating task event:', error);
    return null;
  }
};

/**
 * Update a calendar event for a task
 * @param eventId Event ID to update
 * @param task Updated task data
 * @returns Whether update was successful
 */
export const updateTaskEvent = async (
  eventId: string,
  task: Task
): Promise<boolean> => {
  try {
    if (!task.dueDate) {
      // If task no longer has due date, delete the event
      return await deleteCalendarEvent(eventId);
    }
    
    const dueDate = new Date(task.dueDate);
    const startDate = new Date(dueDate.getTime() - 30 * 60000);
    
    await Calendar.updateEventAsync(eventId, {
      title: `📋 ${task.title}`,
      notes: task.description || 'Task from Nudgely app',
      startDate,
      endDate: dueDate,
    });
    
    return true;
  } catch (error) {
    console.error('Error updating task event:', error);
    return false;
  }
};

/**
 * Create recurring calendar events for a habit
 * @param habit Habit to create events for
 * @param calendarId Calendar ID to create events in
 * @returns Array of event IDs
 */
export const createHabitEvents = async (
  habit: Habit,
  calendarId: string
): Promise<string[]> => {
  try {
    const eventIds: string[] = [];
    const now = new Date();
    
    // Create events for the next 30 days
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() + i);
      
      // Check if habit should occur on this day
      if (!shouldHabitOccurOnDate(habit, eventDate)) {
        continue;
      }
      
      // Determine event time based on habit frequency times
      const eventTime = getHabitEventTime(habit, eventDate);
      
      const eventId = await Calendar.createEventAsync(calendarId, {
        title: `🎯 ${habit.title}`,
        notes: habit.description || 'Habit from Nudgely app',
        startDate: eventTime,
        endDate: new Date(eventTime.getTime() + 30 * 60000), // 30 minutes duration
        allDay: false,
        alarms: [{ relativeOffset: -5 }], // 5 minutes before
      });
      
      eventIds.push(eventId);
    }
    
    return eventIds;
  } catch (error) {
    console.error('Error creating habit events:', error);
    return [];
  }
};

/**
 * Check if habit should occur on a specific date
 */
const shouldHabitOccurOnDate = (habit: Habit, date: Date): boolean => {
  if (habit.frequency.type === 'daily') {
    return true;
  } else if (habit.frequency.type === 'weekly' && habit.frequency.days) {
    return habit.frequency.days.includes(date.getDay());
  } else if (habit.frequency.type === 'monthly') {
    // For monthly habits, occur on the same day of month as creation
    const creationDate = new Date(habit.createdAt);
    return date.getDate() === creationDate.getDate();
  }
  return false;
};

/**
 * Get the appropriate time for a habit event
 */
const getHabitEventTime = (habit: Habit, date: Date): Date => {
  const eventTime = new Date(date);
  
  if (habit.frequency.times?.morning) {
    eventTime.setHours(8, 0, 0, 0); // 8:00 AM
  } else if (habit.frequency.times?.afternoon) {
    eventTime.setHours(14, 0, 0, 0); // 2:00 PM
  } else if (habit.frequency.times?.evening) {
    eventTime.setHours(19, 0, 0, 0); // 7:00 PM
  } else {
    eventTime.setHours(9, 0, 0, 0); // Default to 9:00 AM
  }
  
  return eventTime;
};

/**
 * Delete a calendar event
 * @param eventId Event ID to delete
 * @returns Whether deletion was successful
 */
export const deleteCalendarEvent = async (eventId: string): Promise<boolean> => {
  try {
    await Calendar.deleteEventAsync(eventId);
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
};

/**
 * Delete multiple calendar events
 * @param eventIds Array of event IDs to delete
 * @returns Number of successfully deleted events
 */
export const deleteCalendarEvents = async (eventIds: string[]): Promise<number> => {
  let deletedCount = 0;
  
  for (const eventId of eventIds) {
    const success = await deleteCalendarEvent(eventId);
    if (success) deletedCount++;
  }
  
  return deletedCount;
};

/**
 * Sync all tasks to calendar
 * @param tasks Array of tasks to sync
 * @param calendarId Calendar ID to sync to
 * @returns Object with count and event IDs
 */
export const syncTasksToCalendar = async (
  tasks: Task[],
  calendarId: string
): Promise<{ count: number; eventIds: string[] }> => {
  let createdCount = 0;
  const eventIds: string[] = [];
  
  for (const task of tasks) {
    if (task.dueDate && !task.completed) {
      const eventId = await createTaskEvent(task, calendarId);
      if (eventId) {
        createdCount++;
        eventIds.push(eventId);
      }
    }
  }
  
  return { count: createdCount, eventIds };
};

/**
 * Sync all habits to calendar
 * @param habits Array of habits to sync
 * @param calendarId Calendar ID to sync to
 * @returns Object with count and event IDs
 */
export const syncHabitsToCalendar = async (
  habits: Habit[],
  calendarId: string
): Promise<{ count: number; eventIds: string[] }> => {
  let createdCount = 0;
  const allEventIds: string[] = [];
  
  for (const habit of habits) {
    const eventIds = await createHabitEvents(habit, calendarId);
    createdCount += eventIds.length;
    allEventIds.push(...eventIds);
  }
  
  return { count: createdCount, eventIds: allEventIds };
};

/**
 * Delete all Nudgely events from calendar
 * @param eventIds Array of event IDs to delete
 * @returns Number of successfully deleted events
 */
export const deleteAllNudgelyEvents = async (eventIds: string[]): Promise<number> => {
  let deletedCount = 0;
  
  for (const eventId of eventIds) {
    try {
      await Calendar.deleteEventAsync(eventId);
      deletedCount++;
    } catch (error) {
      console.warn(`Failed to delete event ${eventId}:`, error);
      // Continue with other events even if one fails
    }
  }
  
  return deletedCount;
};
