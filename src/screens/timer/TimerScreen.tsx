import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector, useAppDispatch } from '../../store';
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  completeSession,
  addFiveMinutes,
  updateTimerSettings,
} from '../../store/slices/timerSlice';
import { TimerCircle } from '../../components/timer/TimerCircle';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';

export const TimerScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const {
    isRunning,
    currentSession,
    settings,
    currentSessionType,
    completedFocusSessions,
  } = useAppSelector((state) => state.timer);
  
  // Local state for settings form
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  
  // Get current duration based on session type
  const getCurrentDuration = () => {
    switch (currentSessionType) {
      case 'focus':
        return settings.focusDuration;
      case 'shortBreak':
        return settings.shortBreakDuration;
      case 'longBreak':
        return settings.longBreakDuration;
      default:
        return settings.focusDuration;
    }
  };
  
  // Handle timer actions
  const handleStart = () => {
    dispatch(startTimer({}));
  };
  
  const handlePause = () => {
    dispatch(pauseTimer());
  };
  
  const handleResume = () => {
    dispatch(resumeTimer());
  };
  
  const handleStop = () => {
    dispatch(stopTimer());
  };
  
  const handleComplete = () => {
    dispatch(completeSession({}));
  };
  
  const handleAddFiveMinutes = () => {
    dispatch(addFiveMinutes());
  };
  
  // Handle settings update
  const handleSaveSettings = () => {
    dispatch(updateTimerSettings(localSettings));
    setShowSettings(false);
  };
  
  // Handle number input for settings
  const handleNumberInput = (
    value: string,
    field: keyof typeof localSettings,
    min: number,
    max: number
  ) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      setLocalSettings({ ...localSettings, [field]: min });
    } else {
      setLocalSettings({
        ...localSettings,
        [field]: Math.min(Math.max(numValue, min), max),
      });
    }
  };
  
  // Handle toggle input for settings
  const handleToggleInput = (value: boolean, field: keyof typeof localSettings) => {
    setLocalSettings({ ...localSettings, [field]: value });
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
    sessionInfo: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sessionText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      marginRight: theme.spacing.md,
    },
    sessionCount: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    settingsButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.card,
      ...theme.shadows.sm,
    },
    settingsButtonText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.primary,
    },
    settingsContainer: {
      marginTop: theme.spacing.lg,
    },
    settingsTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    settingLabel: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text,
      flex: 2,
    },
    settingInput: {
      flex: 1,
      textAlign: 'center',
    },
    settingSwitch: {
      flex: 1,
      alignItems: 'flex-end',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    timerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
    },
  });
  
  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Focus Timer</Text>
        <TouchableOpacity
          style={dynamicStyles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Text style={dynamicStyles.settingsButtonText}>
            {showSettings ? 'Hide Settings' : 'Settings'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Session Info */}
      <View style={dynamicStyles.sessionInfo}>
        <Text style={dynamicStyles.sessionText}>Completed Sessions:</Text>
        <Text style={dynamicStyles.sessionCount}>{completedFocusSessions}</Text>
      </View>
      
      {/* Settings Panel */}
      {showSettings ? (
        <Card style={dynamicStyles.settingsContainer}>
          <Text style={dynamicStyles.settingsTitle}>Timer Settings</Text>
          
          <View style={dynamicStyles.settingRow}>
            <Text style={dynamicStyles.settingLabel}>Focus Duration (minutes)</Text>
            <TextInput
              style={dynamicStyles.settingInput}
              value={localSettings.focusDuration.toString()}
              onChangeText={(value) => handleNumberInput(value, 'focusDuration', 1, 120)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <Text style={dynamicStyles.settingLabel}>Short Break Duration (minutes)</Text>
            <TextInput
              style={dynamicStyles.settingInput}
              value={localSettings.shortBreakDuration.toString()}
              onChangeText={(value) => handleNumberInput(value, 'shortBreakDuration', 1, 30)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <Text style={dynamicStyles.settingLabel}>Long Break Duration (minutes)</Text>
            <TextInput
              style={dynamicStyles.settingInput}
              value={localSettings.longBreakDuration.toString()}
              onChangeText={(value) => handleNumberInput(value, 'longBreakDuration', 1, 60)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <Text style={dynamicStyles.settingLabel}>Sessions Before Long Break</Text>
            <TextInput
              style={dynamicStyles.settingInput}
              value={localSettings.sessionsBeforeLongBreak.toString()}
              onChangeText={(value) => handleNumberInput(value, 'sessionsBeforeLongBreak', 1, 10)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <Text style={dynamicStyles.settingLabel}>Auto-start Breaks</Text>
            <View style={dynamicStyles.settingSwitch}>
              <Switch
                value={localSettings.autoStartBreaks}
                onValueChange={(value) => handleToggleInput(value, 'autoStartBreaks')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={localSettings.autoStartBreaks ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <Text style={dynamicStyles.settingLabel}>Auto-start Pomodoros</Text>
            <View style={dynamicStyles.settingSwitch}>
              <Switch
                value={localSettings.autoStartPomodoros}
                onValueChange={(value) => handleToggleInput(value, 'autoStartPomodoros')}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={localSettings.autoStartPomodoros ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
          
          <View style={dynamicStyles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => {
                setLocalSettings(settings);
                setShowSettings(false);
              }}
              variant="outline"
            />
            <Button title="Save" onPress={handleSaveSettings} variant="primary" />
          </View>
        </Card>
      ) : (
        <View style={dynamicStyles.timerContainer}>
          <TimerCircle
            duration={getCurrentDuration()}
            isRunning={isRunning}
            isPaused={isRunning && !currentSession}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onComplete={handleComplete}
            onAddFiveMinutes={handleAddFiveMinutes}
            timerType={currentSessionType}
          />
          
          <Text style={{ marginTop: theme.spacing.lg, color: theme.colors.text, textAlign: 'center' }}>
            {currentSessionType === 'focus'
              ? 'Focus on your task. Stay present and avoid distractions.'
              : currentSessionType === 'shortBreak'
              ? 'Take a short break. Stretch, breathe, or grab a glass of water.'
              : 'Take a longer break. Move around or do something relaxing.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
