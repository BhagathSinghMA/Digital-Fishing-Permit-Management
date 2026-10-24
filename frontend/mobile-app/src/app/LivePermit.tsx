import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BoatOwnerMain from '../pages/BoatOwnerMain';
import { useAuth } from '../context/AuthContext';

export default function LivePermitRoute() {
  const { registrationNumber: paramRegNum } = useLocalSearchParams<{
    registrationNumber?: string;
  }>();
  const router = useRouter();
  const { userId, logout } = useAuth();

  const registrationNumber = paramRegNum || userId || 'TN-09-MM-1234';

  return (
    <BoatOwnerMain
      registrationNumber={registrationNumber}
      initialTab="live_permit"
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
