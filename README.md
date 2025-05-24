# Nudgely

A mobile productivity and to-do app built with Expo and React Native that helps users efficiently manage their tasks, build positive habits, and stay focused.

## Features

- **Smart To-Do List**: Organize tasks with categories, priorities, and quick-add functionality
- **Habit Tracker**: Track habits with streaks and daily/weekly views
- **Focus Timer**: Pomodoro-style timer for deep work sessions
- **Push Notifications**: Get reminders and motivational messages
- **Clean UI/UX**: Enjoy a minimal interface with light/dark modes
- **Local Storage**: Save your data with AsyncStorage
- **Optional Firebase Integration**: Sync your data across devices
- **Gesture Support**: Swipe to complete or delete tasks
- **Calendar Integration**: Sync with Google or iOS calendars

## Tech Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **Redux Toolkit**: State management
- **Redux Persist**: Persist and rehydrate Redux store
- **React Navigation**: Navigation library
- **AsyncStorage**: Local storage solution
- **Expo Notifications**: Push notifications
- **Expo Calendar**: Calendar integration
- **React Native Gesture Handler**: Gesture recognition
- **React Native Reanimated**: Animations
- **TypeScript**: Type safety

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nudgely.git
   cd nudgely
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

4. Follow the instructions in the terminal to open the app on your device or emulator.

## Project Structure

```
nudgely/
├── assets/                # Images, fonts, and other static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Common UI components
│   │   ├── tasks/         # Task-related components
│   │   ├── habits/        # Habit-related components
│   │   └── timer/         # Timer-related components
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Screen components
│   │   ├── tasks/         # Task screens
│   │   ├── habits/        # Habit screens
│   │   ├── timer/         # Timer screens
│   │   └── settings/      # Settings screens
│   ├── store/             # Redux store configuration
│   │   └── slices/        # Redux slices
│   ├── theme/             # Theme configuration
│   └── utils/             # Utility functions
├── App.tsx                # Main app component
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── package.json           # Project dependencies
└── tsconfig.json          # TypeScript configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/)
