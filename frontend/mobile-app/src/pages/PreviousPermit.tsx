import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getPermitHistory, PermitHistoryItem } from '../services/api';

interface PreviousPermitProps {
  registrationNumber?: string;
}

export default function PreviousPermit({ registrationNumber }: PreviousPermitProps) {
  const [permits, setPermits] = useState<PermitHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    const data = await getPermitHistory(registrationNumber);
    setPermits(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [registrationNumber]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [registrationNumber])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const parseCustomDate = (dateStr: string): Date => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(NaN);

    const cleanStr = dateStr.trim();

    const monthNames: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };

    // 1. Text Month Format: "19 Aug 2026", "19 Aug 2026, 02:30 PM", "19 August 2026 14:30:00"
    const textMonthMatch = cleanStr.match(
      /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*([APap][Mm]))?)?$/
    );
    if (textMonthMatch) {
      const day = parseInt(textMonthMatch[1], 10);
      const mStr = textMonthMatch[2].substring(0, 3).toLowerCase();
      const month = monthNames[mStr] !== undefined ? monthNames[mStr] : -1;
      const year = parseInt(textMonthMatch[3], 10);

      const hasTime = textMonthMatch[4] !== undefined;
      let hours = hasTime ? parseInt(textMonthMatch[4], 10) : 23;
      const minutes = hasTime ? parseInt(textMonthMatch[5], 10) : 59;
      const seconds = hasTime && textMonthMatch[6] ? parseInt(textMonthMatch[6], 10) : (hasTime ? 0 : 59);
      const ampm = textMonthMatch[7]?.toUpperCase();

      if (ampm) {
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }

      if (month !== -1) {
        return new Date(year, month, day, hours, minutes, seconds, hasTime ? 0 : 999);
      }
    }

    // 2. Numeric Slash or Dash Format: "19/08/2026", "19-08-2026", "19/08/2026 14:30"
    const numMatch = cleanStr.match(
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*([APap][Mm]))?)?$/
    );
    if (numMatch) {
      const day = parseInt(numMatch[1], 10);
      const month = parseInt(numMatch[2], 10) - 1;
      const year = parseInt(numMatch[3], 10);

      const hasTime = numMatch[4] !== undefined;
      let hours = hasTime ? parseInt(numMatch[4], 10) : 23;
      const minutes = hasTime ? parseInt(numMatch[5], 10) : 59;
      const seconds = hasTime && numMatch[6] ? parseInt(numMatch[6], 10) : (hasTime ? 0 : 59);
      const ampm = numMatch[7]?.toUpperCase();

      if (ampm) {
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }

      return new Date(year, month, day, hours, minutes, seconds, hasTime ? 0 : 999);
    }

    // 3. ISO / Standard format: "2026-08-19T14:30:00" or "2026-08-19"
    const isoMatch = cleanStr.match(
      /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
    );
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);

      const hasTime = isoMatch[4] !== undefined;
      const hours = hasTime ? parseInt(isoMatch[4], 10) : 23;
      const minutes = hasTime ? parseInt(isoMatch[5], 10) : 59;
      const seconds = hasTime && isoMatch[6] ? parseInt(isoMatch[6], 10) : (hasTime ? 0 : 59);

      return new Date(year, month, day, hours, minutes, seconds, hasTime ? 0 : 999);
    }

    // 4. Fallback direct parse
    const directDate = new Date(cleanStr);
    if (!isNaN(directDate.getTime())) {
      if (!cleanStr.includes(':')) {
        directDate.setHours(23, 59, 59, 999);
      }
      return directDate;
    }

    return directDate;
  };

  const isPermitExpired = (item: PermitHistoryItem) => {
    if (!item) return false;
    const status = (item.status || '').toUpperCase();
    if (status === 'EXPIRED') return true;
    if (status === 'REJECTED' || status === 'CANCELLED' || status === 'PENDING') {
      return false;
    }
    if (!item.expiryDate) return false;

    const expiry = parseCustomDate(item.expiryDate);
    if (isNaN(expiry.getTime())) {
      return false;
    }
    return new Date() >= expiry;
  };

  const getStatusConfig = (status: string, isExpired?: boolean) => {
    if (isExpired) {
      return {
        bg: '#f1f5f9',
        text: '#64748b',
        border: '#cbd5e1',
        dot: '#94a3b8',
        label: 'EXPIRED',
      };
    }
    const s = (status || '').toUpperCase();
    if (s === 'COMPLETED' || s === 'APPROVED') {
      return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#16a34a', label: 'APPROVED' };
    }
    if (s === 'EXPIRED') {
      return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1', dot: '#94a3b8', label: 'EXPIRED' };
    }
    if (s === 'REJECTED' || s === 'CANCELLED') {
      return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca', dot: '#dc2626', label: 'REJECTED' };
    }
    if (s === 'PENDING') {
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#d97706', label: 'PENDING' };
    }
    return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', dot: '#2563eb', label: s || 'PERMIT' };
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
            {/* <Text style={styles.tamilTitle}>முந்தைய அனுமதிப் பதிவுகள்</Text> */}
            <Text style={styles.subtitle}>Historical voyage clearance tokens and manifest archives.</Text>
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
            <Text style={styles.loadingText}>Retrieving permit archives...</Text>
          </View>
        ) : permits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="folder-off" size={38} color="#005bb0" />
            </View>
            <Text style={styles.emptyTitle}>No Previous Permits Found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any past permit history recorded yet. Issued voyage permits will appear here.
            </Text>
          </View>
        ) : (
          permits.map((item, index) => {
            const isExpired = isPermitExpired(item);
            const statusConfig = getStatusConfig(item.status, isExpired);

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

                <View style={styles.divider} />

                {/* Card Body Details */}
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Boat Name</Text>
                    <Text style={[styles.detailValue, isExpired && styles.expiredDetailValue]}>
                      {item.boatName || 'Sea King'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registration No.</Text>
                    <Text
                      style={[
                        styles.detailValueHighlight,
                        isExpired && styles.expiredHighlight,
                      ]}
                    >
                      {item.registrationNumber || registrationNumber || 'TN-09-MM-1234'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Crew Manifest</Text>
                    <View style={styles.crewTag}>
                      <MaterialCommunityIcons
                        name="account-group"
                        size={14}
                        color={isExpired ? '#64748b' : '#005bb0'}
                      />
                      <Text
                        style={[
                          styles.crewCountValue,
                          isExpired && styles.expiredCrewValue,
                        ]}
                      >
                        {item.crewCount} Members
                      </Text>
                    </View>
                  </View>

                  {/* Dual-Pane Voyage Validity Timeline */}
                  <View
                    style={[
                      styles.datesContainer,
                      isExpired && styles.expiredDatesContainer,
                    ]}
                  >
                    <View style={styles.dateCol}>
                      <View style={styles.dateHeaderRow}>
                        <MaterialIcons name="event-available" size={13} color="#64748b" />
                        <Text style={styles.dateLabel}>ISSUED AT</Text>
                      </View>
                      <Text
                        style={[
                          styles.dateValue,
                          isExpired && styles.expiredDateValue,
                        ]}
                      >
                        {item.issuedDate || 'N/A'}
                      </Text>
                    </View>

                    <View style={styles.dateDivider} />

                    <View style={styles.dateCol}>
                      <View style={styles.dateHeaderRow}>
                        <MaterialIcons name="event-busy" size={13} color="#64748b" />
                        <Text style={styles.dateLabel}>VALID UNTIL</Text>
                      </View>
                      <Text
                        style={[
                          styles.dateValue,
                          isExpired && styles.expiredDateValue,
                        ]}
                      >
                        {item.expiryDate || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginTop: 20,
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

  // Permit Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permitNumBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBoxSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
  },
  permitNumberText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  cardBody: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailValueHighlight: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#005bb0',
  },
  crewTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  crewCountValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#005bb0',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
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
    fontSize: 9.5,
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
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
    alignSelf: 'center',
  },

  // Expired Card Overrides
  expiredCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    opacity: 0.9,
  },
  expiredText: {
    color: '#475569',
  },
  expiredDetailValue: {
    color: '#475569',
  },
  expiredHighlight: {
    color: '#475569',
  },
  expiredDatesContainer: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  expiredDateValue: {
    color: '#64748b',
  },
  expiredCrewValue: {
    color: '#64748b',
  },
});
