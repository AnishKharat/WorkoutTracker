import React, { useEffect } from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Colors } from './constants/colors';
import HomeScreen from './screens/HomeScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import CardioScreen from './screens/CardioScreen';
import ExercisePickerScreen from './screens/ExercisePickerScreen';
import BodyHeatmapScreen from './screens/BodyHeatmapScreenLibrary';
import AlarmScreen from './screens/AlarmScreen';
import ProfileScreen from './screens/ProfileScreen';
import AppIcon from './components/AppIcon';

import * as TaskManager from 'expo-task-manager';
import { scheduleMorningCheck } from './utils/notificationScheduler';

import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';

const BACKGROUND_CHECK_TASK = 'BACKGROUND_MISSED_WORKOUT_CHECK';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.background,
    border: Colors.border,
    text: Colors.textPrimary,
    primary: Colors.accent,
    notification: Colors.accent,
  },
};

TaskManager.defineTask(BACKGROUND_CHECK_TASK, async () => {
  return;
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function WorkoutStack() {
  const insets = useSafeAreaInsets();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        cardStyle: {
          backgroundColor: Colors.background,
          paddingTop: insets.top,
        },
      }}
    >
      <Stack.Screen name="StrengthActive" component={WorkoutScreen} />
      <Stack.Screen name="CardioLog" component={CardioScreen} />
      <Stack.Screen name="ExercisePicker" component={ExercisePickerScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    scheduleMorningCheck();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}

function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" backgroundColor={Colors.background} translucent={false} />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            sceneStyle: {
              backgroundColor: Colors.background,
              paddingTop: insets.top,
            },
            tabBarStyle: {
              backgroundColor: Colors.background,
              borderTopColor: Colors.border,
              paddingBottom: Math.max(insets.bottom, 8),
              paddingTop: 8,
              height: 52 + Math.max(insets.bottom, 8),
            },
            tabBarActiveTintColor: Colors.accent,
            tabBarInactiveTintColor: Colors.textMuted,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ tabBarIcon: ({ color }) => <AppIcon name="home" size={20} color={color} /> }}
          />
          <Tab.Screen
            name="WorkoutStack"
            component={WorkoutStack}
            options={{ title: 'Workout', tabBarIcon: ({ color }) => <AppIcon name="workout" size={20} color={color} /> }}
          />
          <Tab.Screen
            name="Heatmap"
            component={BodyHeatmapScreen}
            options={{ tabBarIcon: ({ color }) => <AppIcon name="heatmap" size={20} color={color} /> }}
          />
          <Tab.Screen
            name="Alarms"
            component={AlarmScreen}
            options={{ tabBarIcon: ({ color }) => <AppIcon name="alarm" size={20} color={color} /> }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ tabBarIcon: ({ color }) => <AppIcon name="profile" size={20} color={color} /> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}
