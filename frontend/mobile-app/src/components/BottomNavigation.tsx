import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabKey = 'home' | 'previous_permit' | 'live_permit' | 'profile';

interface BottomNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'previous_permit', label: 'Previous Permit', icon: 'description' },
    { key: 'live_permit', label: 'Live Permit', icon: 'directions-boat' },
    { key: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.7}
            style={styles.tabItem}
            onPress={() => onTabChange(tab.key)}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <MaterialIcons
                name={tab.icon}
                size={24}
                color={isActive ? '#005bb0' : '#717784'}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e8ecf4',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '#eaf2ff',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#717784',
    marginTop: 3,
  },
  activeTabLabel: {
    color: '#005bb0',
    fontWeight: '700',
  },
});

