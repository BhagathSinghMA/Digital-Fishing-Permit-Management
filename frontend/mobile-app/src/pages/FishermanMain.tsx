import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomNavigation, { TabKey } from '../components/BottomNavigation';
import FishermanHome from './FishermanHome';
import FishermanPreviousPermit from './FishermanPreviousPermit';
import FishermanLivePermit from './FishermanLivePermit';
import FishermanProfile from './FishermanProfile';

interface FishermanMainProps {
  fishermanId?: string;
  onLogout?: () => void;
  initialTab?: TabKey;
}

export default function FishermanMain({
  fishermanId,
  onLogout,
  initialTab = 'home',
}: FishermanMainProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <FishermanHome fishermanId={fishermanId} />;
      case 'previous_permit':
        return <FishermanPreviousPermit fishermanId={fishermanId} />;
      case 'live_permit':
        return <FishermanLivePermit fishermanId={fishermanId} />;
      case 'profile':
        return <FishermanProfile fishermanId={fishermanId} onLogout={onLogout} />;
      default:
        return <FishermanHome fishermanId={fishermanId} />;
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
