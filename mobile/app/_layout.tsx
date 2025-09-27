import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';
import AuthProvider from './auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};


function LayoutWithAuth() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{  headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'My Profile', headerShown: true }} />
        <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
        <Stack.Screen name="create-job" options={{ title: 'Create Job' }} />
        <Stack.Screen name="job-detail" options={{ title: 'Job Details' }} />
        <Stack.Screen name="edit-job" options={{ title: 'Edit Job' }} />
        <Stack.Screen name="job-applications" options={{ title: 'Job Applications' }} />
        <Stack.Screen name="my-cvs" options={{ title: 'My CVs' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutWithAuth />
    </AuthProvider>
  );
}
