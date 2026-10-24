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
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getFishermanPermitHistory, FishermanPermitHistoryItem } from '../services/api';

interface FishermanPreviousPermitProps {
  fishermanId?: string;
}

export default function FishermanPreviousPermit({
  fishermanId,
}: FishermanPreviousPermitProps) {
  const [permits, setPermits] = useState<FishermanPermitHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    const list = await getFishermanPermitHistory(fishermanId);
    setPermits(list);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [fishermanId]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fishermanId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
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

  const getStatusConfig = (status: string, expiryDate?: string) => {
    let s = (status || '').toUpperCase();

    if ((s === 'ACTIVE' || s === 'APPROVED') && isExpiredByDate(expiryDate)) {
      s = 'EXPIRED';
    }

    if (s === 'ACTIVE' || s === 'APPROVED') {
      return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#16a34a', label: 'APPROVED' };
    }
    if (s === 'PENDING') {
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#d97706', label: 'PENDING' };
    }
    if (s === 'REJECTED') {
      return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', dot: '#dc2626', label: 'REJECTED' };
    }
    if (s === 'EXPIRED') {
      return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', dot: '#94a3b8', label: 'EXPIRED' };
    }
    return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', dot: '#94a3b8', label: s || 'EXPIRED' };
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
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Permit History</Text>
            <Text style={styles.tamilTitle}>முந்தைய அனுமதிப் பதிவுகள்</Text>
            <Text style={styles.subtitle}>Historical voyage clearance tokens and crew records.</Text>
          </View>

          {permits.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{permits.length} Records</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bb0" />
            <Text style={styles.loadingText}>Retrieving voyage history...</Text>
          </View>
        ) : permits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="folder-off" size={38} color="#005bb0" />
            </View>
            <Text style={styles.emptyTitle}>No Previous Permits Found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any past permit history recorded yet. Issued voyage clearances will appear here.
            </Text>
          </View>
        ) : (
          permits.map((item, index) => {
            const statusConfig = getStatusConfig(item.status, item.expiryDate);
            const isExpired = statusConfig.label === 'EXPIRED';

            return (
              <View
                key={item.permitNumber + index}
                style={[styles.card, isExpired && styles.expiredCard]}
              >
                {/* Card Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.permitNumBox}>
                    <View style={styles.iconBoxSmall}>
                      <MaterialIcons
                        name="receipt-long"
                        size={18}
                        color={isExpired ? '#64748b' : '#005bb0'}
                      />
                    </View>
                    <View>
                      <Text style={styles.tokenLabel}>PERMIT TOKEN</Text>
                      <Text style={[styles.permitNumberText, isExpired && styles.expiredText]}>
                        {item.permitNumber || 'TN-FP-HISTORICAL'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* Vessel Info Banner */}
                <View style={styles.vesselBanner}>
                  <View style={styles.vesselInfoCol}>
                    <Text style={styles.vesselNameLabel}>VESSEL</Text>
                    <Text style={styles.vesselName}>{item.boatName || 'Sea King'}</Text>
                  </View>
                  <View style={styles.vesselRegPill}>
                    <Text style={styles.vesselRegText}>{item.registrationNumber}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Info Details */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Boat Owner</Text>
                  <Text style={styles.infoValue}>{item.ownerName || 'Ramesh'}</Text>
                </View>

                {/* Dual-Pane Validity Timeline */}
                <View style={styles.dateGrid}>
                  <View style={styles.dateCol}>
                    <View style={styles.dateHeaderRow}>
                      <MaterialIcons name="event-available" size={13} color="#64748b" />
                      <Text style={styles.dateLabel}>ISSUED DATE</Text>
                    </View>
                    <Text style={styles.dateValue}>{item.issuedDate || 'N/A'}</Text>
                  </View>

                  <View style={styles.dateDivider} />

                  <View style={styles.dateCol}>
                    <View style={styles.dateHeaderRow}>
                      <MaterialIcons name="event-busy" size={13} color="#64748b" />
                      <Text style={styles.dateLabel}>EXPIRY DATE</Text>
                    </View>
                    <Text style={styles.dateValue}>{item.expiryDate || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Security Footer Note */}
        <View style={styles.securityFooter}>
          <MaterialCommunityIcons name="shield-check" size={14} color="#94a3b8" />
          <Text style={styles.securityFooterText}>
            Tamil Nadu Fisheries Department • Authorized Records
          </Text>
        </View>
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
    alignItems: 'flex-start',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  countPill: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  countPillText: {
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

  // Empty State
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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

  // History Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  expiredCard: {
    borderColor: '#e2e8f0',
    backgroundColor: '#fafcff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  permitNumBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBoxSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  permitNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  expiredText: {
    color: '#475569',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  vesselBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  vesselInfoCol: {
    flex: 1,
  },
  vesselNameLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  vesselName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  vesselRegPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  vesselRegText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#005bb0',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  dateGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateCol: {
    flex: 1,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  dateValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  dateDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
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
