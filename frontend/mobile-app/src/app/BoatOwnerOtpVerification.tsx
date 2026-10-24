import React from 'react';
import { useRouter } from 'expo-router';
import { BoatOwnerOtpVerification } from '../pages';

export default function BoatOwnerOtpVerificationRoute() {
  const router = useRouter();
  return (
    <BoatOwnerOtpVerification
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/BoatLogin' as any);
        }
      }}
    />
  );
}
