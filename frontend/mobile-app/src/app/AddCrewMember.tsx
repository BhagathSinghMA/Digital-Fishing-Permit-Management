import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AddCrewMember } from '../pages';

export default function AddCrewMemberRoute() {
  const router = useRouter();
  const { registrationNumber } = useLocalSearchParams<{ registrationNumber?: string }>();

  return (
    <AddCrewMember
      onBack={() => router.back()}
      onDone={(crew) => {
        router.push({
          pathname: '/PermitReview',
          params: { registrationNumber, crewData: JSON.stringify(crew) },
        } as any);
      }}
      onSuccess={() => {
        router.replace({
          pathname: '/BoatOwnerDashboard',
          params: { registrationNumber, initialTab: 'live_permit' },
        } as any);
      }}
    />
  );
}
