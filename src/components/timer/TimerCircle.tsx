import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../common/Button';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerCircleProps {
  duration: number; // in minutes
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onComplete: () => void;
  onAddFiveMinutes: () => void;
  timerType: 'focus' | 'shortBreak' | 'longBreak';
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  duration,
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  onComplete,
  onAddFiveMinutes,
  timerType,
}) => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  // Animation values
  const progress = useSharedValue(1);
  const CIRCLE_LENGTH = 1000; // The circumference of the circle
  const R = CIRCLE_LENGTH / (2 * Math.PI); // Calculate radius from circumference
  
  // Get color based on timer type
  const getTimerColor = () => {
    switch (timerType) {
      case 'focus':
        return theme.colors_extended.primary[theme.dark ? 'dark' : 'light'];
      case 'shortBreak':
        return theme.colors_extended.success[theme.dark ? 'dark' : 'light'];
      case 'longBreak':
        return theme.colors_extended.info[theme.dark ? 'dark' : 'light'];
      default:
        return theme.colors.primary;
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Animated props for the circle
  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCLE_LENGTH * progress.value,
    };
  }) as any; // Type assertion to fix TypeScript error
  
  // Start the timer
  const startTimer = () => {
    if (!isRunning) {
      onStart();
    } else if (isPaused) {
      onResume();
    }
    
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Start a new interval
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setIntervalId(id);
  };
  
  // Pause the timer
  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    onPause();
  };
  
  // Stop the timer
  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimeLeft(duration * 60);
    progress.value = 1;
    onStop();
  };
  
  // Add five minutes to the timer
  const addFiveMinutes = () => {
    setTimeLeft((prev) => prev + 5 * 60);
    onAddFiveMinutes();
  };
  
  // Update the progress animation when timeLeft changes
  useEffect(() => {
    const totalSeconds = duration * 60;
    const newProgress = timeLeft / totalSeconds;
    
    progress.value = withTiming(newProgress, {
      duration: 1000,
      easing: Easing.linear,
    });
  }, [timeLeft, duration]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration * 60);
    progress.value = 1;
  }, [duration]);
  
  // Manage interval based on isRunning and isPaused
  useEffect(() => {
    if (isRunning && !isPaused && !intervalId) {
      startTimer();
    } else if (isPaused && intervalId) {
      pauseTimer();
    }
  }, [isRunning, isPaused]);
  
  const dynamicStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },
    timerContainer: {
      width: 300,
      height: 300,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    timeText: {
      fontSize: 60,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    timerTypeText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
  });
  
  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.timerTypeText}>
        {timerType === 'focus' 
          ? 'Focus Time' 
          : timerType === 'shortBreak' 
            ? 'Short Break' 
            : 'Long Break'}
      </Text>
      
      <View style={dynamicStyles.timerContainer}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${2 * R} ${2 * R}`}>
          {/* Background Circle */}
          <Circle
            cx={R}
            cy={R}
            r={R - 40}
            stroke={theme.colors.border}
            strokeWidth={20}
            fill="transparent"
          />
          
          {/* Progress Circle */}
          <AnimatedCircle
            cx={R}
            cy={R}
            r={R - 40}
            stroke={getTimerColor()}
            strokeWidth={20}
            fill="transparent"
            strokeDasharray={CIRCLE_LENGTH}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
        
        <View style={{ position: 'absolute' }}>
          <Text style={dynamicStyles.timeText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>
      
      <View style={dynamicStyles.buttonContainer}>
        {!isRunning ? (
          <Button
            title="Start"
            onPress={startTimer}
            variant="primary"
            size="large"
            style={{ minWidth: 120 }}
          />
        ) : isPaused ? (
          <Button
            title="Resume"
            onPress={startTimer}
            variant="primary"
            size="large"
            style={{ minWidth: 120 }}
          />
        ) : (
          <Button
            title="Pause"
            onPress={pauseTimer}
            variant="warning"
            size="large"
            style={{ minWidth: 120 }}
          />
        )}
        
        <Button
          title="Stop"
          onPress={stopTimer}
          variant="danger"
          size="large"
          style={{ minWidth: 120 }}
        />
        
        <Button
          title="+5 min"
          onPress={addFiveMinutes}
          variant="secondary"
          size="large"
          style={{ minWidth: 120 }}
        />
      </View>
    </View>
  );
};
