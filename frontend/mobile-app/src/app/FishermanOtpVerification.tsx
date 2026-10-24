import React from 'react';
import { useRouter } from 'expo-router';
import { FishermanOtpVerification } from '../pages';

export default function FishermanOtpVerificationRoute() {
  const router = useRouter();
  return (
    <FishermanOtpVerification
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/FishermanLogin' as any);
        }
      }}
    />
  );
}
