import React, { useState, useEffect } from 'react';
import RoleSelection from '../pages/RoleSelection';
import BoatLogin from '../pages/BoatLogin';
import BoatOwnerOtpVerification from '../pages/BoatOwnerOtpVerification';
import BoatOwnerMain from '../pages/BoatOwnerMain';
import AddCrewMember from '../pages/AddCrewMember';
import PermitReview from '../pages/PermitReview';
import FishermanLogin from '../pages/FishermanLogin';
import FishermanOtpVerification from '../pages/FishermanOtpVerification';
import FishermanMain from '../pages/FishermanMain';
import { FishermanSearchResult } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { isLoading, isLoggedIn, userRole, userId, logout } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<
    | 'role_selection'
    | 'boat_login'
    | 'boat_owner_otp'
    | 'boat_owner_dashboard'
    | 'add_crew_member'
    | 'permit_review'
    | 'fisherman_login'
    | 'fisherman_otp'
    | 'fisherman_dashboard'
  >('role_selection');

  const [registrationNumber, setRegistrationNumber] = useState('TN-09-MM-1234');
  const [fishermanId, setFishermanId] = useState('FSH123456');
  const [fishermanPhone, setFishermanPhone] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<FishermanSearchResult[]>([]);
  const [initialTab, setInitialTab] = useState<'home' | 'previous_permit' | 'live_permit' | 'profile'>('home');

  // Sync screen and credentials when authentication state loads or changes
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn && userRole === 'boat_owner') {
        if (userId) setRegistrationNumber(userId);
        setCurrentScreen((prev) => {
          // Preserve sub-flows if already in boat owner flow, otherwise go to dashboard
          if (prev === 'add_crew_member' || prev === 'permit_review') {
            return prev;
          }
          return 'boat_owner_dashboard';
        });
      } else if (isLoggedIn && userRole === 'fisherman') {
        if (userId) setFishermanId(userId);
        setCurrentScreen('fisherman_dashboard');
      } else if (!isLoggedIn) {
        setCurrentScreen('role_selection');
      }
    }
  }, [isLoading, isLoggedIn, userRole, userId]);

  // While checking local storage, return null (splash screen is visible and covers the view)
  if (isLoading) {
    return null;
  }

  if (currentScreen === 'fisherman_dashboard') {
    return (
      <FishermanMain
        fishermanId={fishermanId}
        onLogout={async () => {
          await logout();
          setInitialTab('home');
          setCurrentScreen('role_selection');
        }}
      />
    );
  }

  if (currentScreen === 'permit_review') {
    return (
      <PermitReview
        registrationNumber={registrationNumber}
        crewMembers={selectedCrew}
        onBack={() => setCurrentScreen('add_crew_member')}
        onApplySuccess={() => {
          setInitialTab('live_permit');
          setCurrentScreen('boat_owner_dashboard');
        }}
      />
    );
  }

  if (currentScreen === 'add_crew_member') {
    return (
      <AddCrewMember
        registrationNumber={registrationNumber}
        initialCrew={selectedCrew}
        onBack={() => setCurrentScreen('boat_owner_dashboard')}
        onDone={(crew) => {
          setSelectedCrew(crew);
          setCurrentScreen('permit_review');
        }}
        onSuccess={() => {
          setInitialTab('live_permit');
          setCurrentScreen('boat_owner_dashboard');
        }}
      />
    );
  }

  if (currentScreen === 'boat_owner_dashboard') {
    return (
      <BoatOwnerMain
        registrationNumber={registrationNumber}
        initialTab={initialTab}
        onAddCrew={() => setCurrentScreen('add_crew_member')}
        onLogout={async () => {
          await logout();
          setInitialTab('home');
          setCurrentScreen('role_selection');
        }}
      />
    );
  }

  if (currentScreen === 'fisherman_otp') {
    return (
      <FishermanOtpVerification
        fishermanId={fishermanId}
        phoneNumber={fishermanPhone}
        onVerifySuccess={() => {
          setCurrentScreen('fisherman_dashboard');
        }}
        onBack={() => setCurrentScreen('fisherman_login')}
      />
    );
  }

  if (currentScreen === 'fisherman_login') {
    return (
      <FishermanLogin
        onSendOtp={(fId, phoneNum) => {
          if (typeof fId === 'string' && fId.trim()) {
            setFishermanId(fId.trim().toUpperCase());
          }
          if (phoneNum) {
            setFishermanPhone(phoneNum);
          }
          setCurrentScreen('fisherman_otp');
        }}
        onBack={() => setCurrentScreen('role_selection')}
      />
    );
  }

  if (currentScreen === 'boat_owner_otp') {
    return (
      <BoatOwnerOtpVerification
        registrationNumber={registrationNumber}
        onVerifySuccess={() => {
          setCurrentScreen('boat_owner_dashboard');
        }}
        onBack={() => setCurrentScreen('boat_login')}
      />
    );
  }

  if (currentScreen === 'boat_login') {
    return (
      <BoatLogin
        onSendOtp={(regNum) => {
          if (typeof regNum === 'string' && regNum.trim()) {
            setRegistrationNumber(regNum.trim().toUpperCase());
          }
          setCurrentScreen('boat_owner_otp');
        }}
        onBack={() => setCurrentScreen('role_selection')}
      />
    );
  }

  return (
    <RoleSelection
      onSelectRole={(role) => {
        if (role === 'boat_owner') {
          setCurrentScreen('boat_login');
        } else if (role === 'fisherman') {
          setCurrentScreen('fisherman_login');
        }
      }}
    />
  );
}


