import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getFishermanHome, FishermanHomeData } from '../services/api';

interface FishermanHomeProps {
  fishermanId?: string;
}

export default function FishermanHome({ fishermanId }: FishermanHomeProps) {
  const [data, setData] = useState<FishermanHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = async () => {
    const result = await getFishermanHome(fishermanId);
    if (result) {
      setData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchHomeData();
  }, [fishermanId]);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fishermanId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const isExpiredByDate = (expiryDateStr?: string) => {
    if (!expiryDateStr) return false;
    try {
      const exp = new Date(expiryDateStr);
      if (!isNaN(exp.getTime())) {
        return new Date() >= exp;
      }
    } catch {}
    return false;
  };

  const getStatusChip = (rawStatus?: string, expiryDate?: string) => {
    let s = (rawStatus || 'NO_PERMIT').toUpperCase();

    if ((s === 'ACTIVE' || s === 'APPROVED') && isExpiredByDate(expiryDate)) {
      s = 'EXPIRED';
    }

    if (s === 'ACTIVE' || s === 'APPROVED') {
      return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#16a34a', label: 'ACTIVE' };
    }
    if (s === 'PENDING') {
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#d97706', label: 'PENDING' };
    }
    if (s === 'EXPIRED') {
      return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', dot: '#94a3b8', label: 'EXPIRED' };
    }
    if (s === 'REJECTED') {
      return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', dot: '#dc2626', label: 'REJECTED' };
    }
    return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', dot: '#94a3b8', label: s };
  };

  const permit = data?.currentPermit;
  const statusChip = getStatusChip(permit?.status, permit?.expiryDate);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#005bb0']} />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Fisherman Portal</Text>
            <Text style={styles.tamilTitle}>மீனவர் சேவை மையம்</Text>
          </View>
          <View style={styles.portalBadge}>
            <MaterialIcons name="verified-user" size={14} color="#005bb0" />
            <Text style={styles.portalBadgeText}>Verified Crew</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bb0" />
            <Text style={styles.loadingText}>Loading biometric clearance...</Text>
          </View>
        ) : (
          <>
            {/* Digital Identity Card (DigiLocker / mParivahan Style) */}
            <View style={styles.identityCard}>
              <View style={styles.idCardTopRow}>
                <View style={styles.tnGovBadge}>
                  <Text style={styles.tnGovText}>GOVT. OF TAMIL NADU • FISHERIES</Text>
                </View>
                <View style={styles.biometricBadge}>
                  <MaterialIcons name="fingerprint" size={14} color="#16a34a" />
                  <Text style={styles.biometricText}>BIOMETRIC VERIFIED</Text>
                </View>
              </View>

              <View style={styles.idMainSection}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{getInitials(data?.name)}</Text>
                </View>
                <View style={styles.idTextContainer}>
                  <Text style={styles.fishermanName}>{data?.name || 'Arun Kumar'}</Text>
                  <Text style={styles.roleSubtext}>Registered Crew Member</Text>
                </View>
              </View>

              <View style={styles.idCardFooter}>
                <View style={styles.idFooterCol}>
                  <Text style={styles.idFooterLabel}>FISHERMAN BIOMETRIC ID</Text>
                  <Text style={styles.idFooterValue}>{data?.fishermanId || fishermanId || 'FSH123456'}</Text>
                </View>
                <View style={styles.idFooterDivider} />
                <View style={styles.idFooterCol}>
                  <Text style={styles.idFooterLabel}>BASE HARBOR</Text>
                  <Text style={styles.idFooterValue}>Rameswaram Post</Text>
                </View>
              </View>
            </View>

            {/* Current Active Permit Section */}
            <View style={styles.sectionHeaderRow}>
              <MaterialIcons name="directions-boat" size={20} color="#005bb0" />
              <Text style={styles.sectionTitle}>Active Voyage Clearance</Text>
            </View>

            {!permit ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <MaterialIcons name="sailing" size={38} color="#005bb0" />
                </View>
                <Text style={styles.emptyTitle}>No Active Voyage Permit</Text>
                <Text style={styles.emptySubtitle}>
                  You are not currently assigned to any voyage manifest. When a registered boat owner adds you to today's permit, details will appear here.
                </Text>
              </View>
            ) : (
              <View style={styles.permitCard}>
                {/* Permit Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.boatTitleRow}>
                    <Text style={styles.boatLabel}>ASSIGNED VESSEL</Text>
                    <Text style={styles.boatName}>{permit.boatName || 'Sea King'}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: statusChip.bg, borderColor: statusChip.border },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusChip.dot }]} />
                    <Text style={[styles.statusChipText, { color: statusChip.text }]}>
                      {statusChip.label}
                    </Text>
                  </View>
                </View>

                {/* Vessel Registration Highlight Box */}
                <View style={styles.regNumberBox}>
                  <Text style={styles.regNumberLabel}>REGISTRATION NUMBER</Text>
                  <Text style={styles.regNumberValue}>{permit.registrationNumber}</Text>
                </View>

                <View style={styles.divider} />

                {/* Info Details */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Boat Owner</Text>
                  <Text style={styles.infoValue}>{permit.ownerName || 'Ramesh'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Permit Token</Text>
                  <Text style={styles.infoValueHighlight}>{permit.permitNumber}</Text>
                </View>

                {/* Dual-Pane Validity Dates */}
                <View style={styles.dateGrid}>
                  <View style={styles.dateBox}>
                    <View style={styles.dateHeaderRow}>
                      <MaterialIcons name="event-available" size={13} color="#64748b" />
                      <Text style={styles.dateLabel}>ISSUED DATE</Text>
                    </View>
                    <Text style={styles.dateValue}>{permit.issueDate || 'Today'}</Text>
                  </View>

                  <View style={styles.dateDivider} />

                  <View style={styles.dateBox}>
                    <View style={styles.dateHeaderRow}>
                      <MaterialIcons name="event-busy" size={13} color="#64748b" />
                      <Text style={styles.dateLabel}>EXPIRY DATE</Text>
                    </View>
                    <Text style={styles.dateValue}>{permit.expiryDate || '24h Validity'}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Maritime Safety Footer Note */}
            <View style={styles.safetyFooter}>
              <MaterialIcons name="shield" size={14} color="#64748b" />
              <Text style={styles.safetyFooterText}>
                Carry your Tamil Nadu Biometric Smart Card during voyage operations at sea.
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
    marginBottom: 20,
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
  fishermanName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  roleSubtext: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
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

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },

  // Empty State
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },

  // Active Permit Card
  permitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  boatTitleRow: {
    flex: 1,
  },
  boatLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  boatName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  regNumberBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  regNumberLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  regNumberValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#005bb0',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13.5,
    color: '#0f172a',
    fontWeight: '700',
  },
  infoValueHighlight: {
    fontSize: 13.5,
    color: '#005bb0',
    fontWeight: '800',
  },
  dateGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateBox: {
    flex: 1,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  dateDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
  },
  safetyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  safetyFooterText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
});
