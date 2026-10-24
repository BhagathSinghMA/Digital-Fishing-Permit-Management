import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigationLayout() {
  const colorScheme = useColorScheme();
  const { isLoading } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay isLoading={isLoading} />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigationLayout />
    </AuthProvider>
  );
}


