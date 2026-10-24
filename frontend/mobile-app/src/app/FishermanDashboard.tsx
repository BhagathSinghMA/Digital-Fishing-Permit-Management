import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FishermanMain from '../pages/FishermanMain';
import { useAuth } from '../context/AuthContext';

export default function FishermanDashboardRoute() {
  const { fishermanId: paramFId, initialTab } = useLocalSearchParams<{
    fishermanId?: string;
    initialTab?: any;
  }>();
  const router = useRouter();
  const { userId, logout } = useAuth();

  const fishermanId = paramFId || userId || 'FSH123456';

  return (
    <FishermanMain
      fishermanId={fishermanId}
      initialTab={initialTab}
      onLogout={async () => {
        await logout();
        router.replace('/');
      }}
    />
  );
}
