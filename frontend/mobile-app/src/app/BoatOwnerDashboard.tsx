import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BoatOwnerMain from '../pages/BoatOwnerMain';
import { useAuth } from '../context/AuthContext';

export default function BoatOwnerDashboardRoute() {
  const { registrationNumber: paramRegNum, initialTab } = useLocalSearchParams<{
    registrationNumber?: string;
    initialTab?: any;
  }>();
  const router = useRouter();
  const { userId, logout } = useAuth();

  const registrationNumber = paramRegNum || userId || 'TN-09-MM-1234';

  return (
    <BoatOwnerMain
      registrationNumber={registrationNumber}
      initialTab={initialTab}
      onAddCrew={() => {
        router.push({
          pathname: '/AddCrewMember',
          params: { registrationNumber },
        } as any);
      }}
      onLogout={async () => {
        await logout();
        router.replace('/');
      }}
    />
  );
}

