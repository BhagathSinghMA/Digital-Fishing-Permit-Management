import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PermitReview } from '../pages';

export default function PermitReviewRoute() {
  const router = useRouter();
  const { registrationNumber } = useLocalSearchParams<{ registrationNumber?: string }>();

  return (
    <PermitReview
      onBack={() => router.back()}
      onApplySuccess={() => {
        router.replace({
          pathname: '/BoatOwnerDashboard',
          params: { registrationNumber, initialTab: 'live_permit' },
        } as any);
      }}
    />
  );
}
