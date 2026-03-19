import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="superadmin" />
      <Stack.Screen name="schooladmin" />
      <Stack.Screen name="studentdashboard" />
    </Stack>
  );
}
