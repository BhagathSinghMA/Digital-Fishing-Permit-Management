import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getBoatOwnerProfile, BoatProfileResponse } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ProfileProps {
  registrationNumber?: string;
  onLogout?: () => void;
}

export default function Profile({ registrationNumber, onLogout }: ProfileProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<BoatProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    const data = await getBoatOwnerProfile(registrationNumber);
    if (data) {
      setProfile(data);
    } else {
      setProfile({
        boatName: 'Sea King',
        registrationNumber: registrationNumber || 'TN-09-MM-1234',
        ownerName: 'Ramesh Kumar',
        phoneNumber: '9876543210',
        fishermanId: 'FSH123456',
        district: 'Nagapattinam',
        state: 'Tamil Nadu',
        port: 'Nagapattinam Fishing Harbour',
        date: '2026-08-16',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [registrationNumber]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'RK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your vessel owner account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          if (onLogout) {
            onLogout();
          }
          try {
            router.replace('/');
          } catch {
            // fallback
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#005bb0']} />
        }
      >
        {/* Screen Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Vessel Owner Profile</Text>
            {/* <Text style={styles.tamilTitle}>படகு உரிமையாளர் சுயவிவரம்</Text> */}
          </View>
          <View style={styles.portalBadge}>
            <MaterialIcons name="verified-user" size={14} color="#005bb0" />
            <Text style={styles.portalBadgeText}>Verified</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bb0" />
            <Text style={styles.loadingText}>Loading profile credentials...</Text>
          </View>
        ) : (
          <>
            {/* Digital Identity Card (DigiLocker / mParivahan Style) */}
            <View style={styles.identityCard}>
              <View style={styles.idCardTopRow}>
                <View style={styles.tnGovBadge}>
                  <Text style={styles.tnGovText}>GOVT. OF TAMIL NADU • FISHERIES</Text>
                </View>
                {/* <View style={styles.biometricBadge}>
                  <MaterialIcons name="fingerprint" size={14} color="#16a34a" />
                  <Text style={styles.biometricText}>BIOMETRIC ID</Text>
                </View> */}
              </View>

              <View style={styles.idMainSection}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{getInitials(profile?.ownerName)}</Text>
                </View>
                <View style={styles.idTextContainer}>
                  <Text style={styles.ownerNameText}>{profile?.ownerName || 'Ramesh Kumar'}</Text>
                  <View style={styles.vesselTag}>
                    <MaterialIcons name="directions-boat" size={14} color="#005bb0" />
                    <Text style={styles.vesselTagText}>{profile?.boatName || 'Sea King'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.idCardFooter}>
                <View style={styles.idFooterCol}>
                  <Text style={styles.idFooterLabel}>REGISTRATION NUMBER</Text>
                  <Text style={styles.idFooterValue}>{profile?.registrationNumber || registrationNumber || 'TN-09-MM-1234'}</Text>
                </View>
                <View style={styles.idFooterDivider} />
                <View style={styles.idFooterCol}>
                  <Text style={styles.idFooterLabel}>FISHERMAN ID</Text>
                  <Text style={styles.idFooterValue}>{profile?.fishermanId || 'FSH123456'}</Text>
                </View>
              </View>
            </View>

            {/* Registration & Credentials Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <MaterialCommunityIcons name="card-account-details-outline" size={20} color="#005bb0" />
                <Text style={styles.cardSectionHeader}>Registration & Identity</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="confirmation-number" size={20} color="#005bb0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Vessel Registration Number</Text>
                  <Text style={styles.valueHighlight}>{profile?.registrationNumber || 'TN-09-MM-1234'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="badge" size={20} color="#005bb0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Fisherman ID</Text>
                  <Text style={styles.value}>{profile?.fishermanId || 'FSH123456'}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginBottom: 0 }]}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="phone" size={20} color="#005bb0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Registered Phone Number</Text>
                  <Text style={styles.value}>+91 {profile?.phoneNumber || '9876543210'}</Text>
                </View>
              </View>
            </View>

            {/* Location & Coastal Jurisdiction Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <MaterialIcons name="place" size={20} color="#005bb0" />
                <Text style={styles.cardSectionHeader}>Location & Harbour Jurisdiction</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="anchor" size={20} color="#005bb0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Authorized Home Port</Text>
                  <Text style={styles.value}>{profile?.port || 'Nagapattinam Fishing Harbour'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="location-city" size={20} color="#005bb0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>District</Text>
                  <Text style={styles.value}>{profile?.district || 'Nagapattinam'}</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginBottom: 0 }]}>
                <View style={styles.iconBox}>
                  <MaterialIcons name="map" size={20} color="#005bb0" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>State Jurisdiction</Text>
                  <Text style={styles.value}>{profile?.state || 'Tamil Nadu'}</Text>
                </View>
              </View>
            </View>

            {/* Logout Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color="#dc2626" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Log Out Account</Text>
            </TouchableOpacity>

            {/* Security Footer Note */}
            <View style={styles.securityFooter}>
              <MaterialIcons name="lock" size={13} color="#94a3b8" />
              <Text style={styles.securityFooterText}>
                Official Tamil Nadu Marine Fisheries Regulation Portal
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  tamilTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0e1fd',
    gap: 4,
  },
  portalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#005bb0',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },

  // Digital Identity Card
  identityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  idCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tnGovBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tnGovText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#005bb0',
    letterSpacing: 0.4,
  },
  biometricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  biometricText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#16a34a',
    letterSpacing: 0.4,
  },
  idMainSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#005bb0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  idTextContainer: {
    flex: 1,
  },
  ownerNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  vesselTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  vesselTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005bb0',
  },
  idCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  idFooterCol: {
    flex: 1,
  },
  idFooterDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  idFooterLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  idFooterValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#005bb0',
  },

  // Detail Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardSectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.2,
    marginBottom: 1,
  },
  value: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  valueHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: '#005bb0',
  },

  // Logout Button
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#dc2626',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  securityFooterText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
});
