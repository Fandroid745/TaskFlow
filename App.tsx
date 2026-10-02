import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { AddTaskScreen } from './src/screens/AddTaskScreen';
import { RootStackParamList } from './src/types';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { user, ready } = useApp();
  if (!ready) return <View style={styles.loading}><ActivityIndicator color={colors.green} size="large" /></View>;
  if (!user) return <AuthScreen />;

  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tasks" component={TasksScreen} />
    <Stack.Screen name="AddTask" component={AddTaskScreen} />
  </Stack.Navigator></NavigationContainer>;
}

export default function App() {
  return <SafeAreaProvider><StatusBar barStyle="dark-content" />
    <AppProvider><AppContent /></AppProvider>
  </SafeAreaProvider>;
}

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper } });
