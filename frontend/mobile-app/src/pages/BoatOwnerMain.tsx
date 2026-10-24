import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomNavigation, { TabKey } from '../components/BottomNavigation';
import BoatOwnerDashboard from './BoatOwnerDashboard';
import PreviousPermit from './PreviousPermit';
import LivePermit from './LivePermit';
import Profile from './Profile';

interface BoatOwnerMainProps {
  registrationNumber?: string;
  onAddCrew?: () => void;
  onLogout?: () => void;
  initialTab?: TabKey;
}

export default function BoatOwnerMain({
  registrationNumber,
  onAddCrew,
  onLogout,
  initialTab = 'home',
}: BoatOwnerMainProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <BoatOwnerDashboard
            registrationNumber={registrationNumber}
            onAddCrew={onAddCrew}
            onViewLivePermit={() => setActiveTab('live_permit')}
          />
        );
      case 'previous_permit':
        return <PreviousPermit registrationNumber={registrationNumber} />;
      case 'live_permit':
        return <LivePermit registrationNumber={registrationNumber} onApplyNewPermit={onAddCrew} />;
      case 'profile':
        return <Profile registrationNumber={registrationNumber} onLogout={onLogout} />;
      default:
        return (
          <BoatOwnerDashboard
            registrationNumber={registrationNumber}
            onAddCrew={onAddCrew}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderTabContent()}</View>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  content: {
    flex: 1,
  },
});
