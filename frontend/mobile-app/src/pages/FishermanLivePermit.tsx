import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { getFishermanLivePermit, FishermanLivePermitData } from '../services/api';

interface FishermanLivePermitProps {
  fishermanId?: string;
}

export default function FishermanLivePermit({ fishermanId }: FishermanLivePermitProps) {
  const [liveData, setLiveData] = useState<FishermanLivePermitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time 24-hour Countdown Timer State
  const [countdown, setCountdown] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
    totalSecondsRemaining: number;
  }>({
    hours: '24',
    minutes: '00',
    seconds: '00',
    isExpired: false,
    totalSecondsRemaining: 24 * 3600,
  });

  const fetchLivePermit = async () => {
    const data = await getFishermanLivePermit(fishermanId);
    setLiveData(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchLivePermit();
  }, [fishermanId]);

  useFocusEffect(
    useCallback(() => {
      fetchLivePermit();
    }, [fishermanId])
  );

  // Auto-polling when status is PENDING to detect officer approval in real-time
  useEffect(() => {
    if (liveData?.status === 'PENDING') {
      const interval = setInterval(() => {
        getFishermanLivePermit(fishermanId).then((data) => {
          if (data) {
            setLiveData(data);
          }
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [liveData?.status, fishermanId]);

  // Robust Date Parser supporting Hermes, JSC, and multi-format strings (e.g. "22 Sep 2026, 10:30 AM", ISO, etc.)
  const parseDateTime = (str?: string): Date | null => {
    if (!str) return null;
    const trimmed = str.trim();

    // 1. Direct JS Date parse
    const directParsed = new Date(trimmed);
    if (!isNaN(directParsed.getTime())) return directParsed;

    // 2. Cleaned comma parse
    try {
      const cleaned = trimmed.replace(/,/g, '');
      const cleanedParsed = new Date(cleaned);
      if (!isNaN(cleanedParsed.getTime())) return cleanedParsed;
    } catch {}

    // 3. Format: "22 Sep 2026, 10:30 AM" or "22 Sep 2026 10:30:00 AM" or "22 Sep 2026"
    try {
      const parts = trimmed.replace(/,/g, '').split(/\s+/);
      const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      if (parts.length >= 3) {
        let day = parseInt(parts[0], 10);
        let month = monthNames.indexOf(parts[1].substring(0, 3).toLowerCase());
        let year = parseInt(parts[2], 10);

        if (month === -1) {
          month = monthNames.indexOf(parts[0].substring(0, 3).toLowerCase());
          day = parseInt(parts[1], 10);
        }

        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (parts.length >= 4) {
          const timeParts = parts[3].split(':');
          hours = parseInt(timeParts[0], 10) || 0;
          minutes = parseInt(timeParts[1], 10) || 0;
          if (timeParts.length >= 3) {
            seconds = parseInt(timeParts[2], 10) || 0;
          }

          if (parts.length >= 5) {
            const ampm = parts[4].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
          }
        }

        if (month !== -1 && !isNaN(day) && !isNaN(year) && year > 1900) {
          return new Date(year, month, day, hours, minutes, seconds);
        }
      }
    } catch {}

    // 4. Fallback for DD-MM-YYYY or YYYY-MM-DD
    try {
      const match = trimmed.match(/^(\d{1,4})[-/](\d{1,2})[-/](\d{1,4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM))?)?/i);
      if (match) {
        let year = parseInt(match[1], 10);
        let month = parseInt(match[2], 10) - 1;
        let day = parseInt(match[3], 10);

        if (day > 1000) {
          const temp = day;
          day = year;
          year = temp;
        }

        let hours = match[4] ? parseInt(match[4], 10) : 0;
        let minutes = match[5] ? parseInt(match[5], 10) : 0;
        let seconds = match[6] ? parseInt(match[6], 10) : 0;
        if (match[7]) {
          const ampm = match[7].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }

        return new Date(year, month, day, hours, minutes, seconds);
      }
    } catch {}

    return null;
  };

  const fallbackExpiryRef = useRef<number | null>(null);

  // Live 1-Second Countdown Timer Engine
  useEffect(() => {
    const statusUpper = (liveData?.status || '').toUpperCase();
    const isActive = liveData?.hasActivePermit || statusUpper === 'APPROVED' || statusUpper === 'ACTIVE';
    if (!liveData || !isActive) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      let targetTime: number;

      const expiryObj = parseDateTime(liveData.expiryTime);
      if (expiryObj && !isNaN(expiryObj.getTime())) {
        targetTime = expiryObj.getTime();
      } else {
        const issuedObj = parseDateTime(liveData.issuedTime);
        if (issuedObj && !isNaN(issuedObj.getTime())) {
          targetTime = issuedObj.getTime() + 24 * 60 * 60 * 1000;
        } else {
          if (!fallbackExpiryRef.current) {
            fallbackExpiryRef.current = now + 24 * 60 * 60 * 1000;
          }
          targetTime = fallbackExpiryRef.current;
        }
      }

      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({
          hours: '00',
          minutes: '00',
          seconds: '00',
          isExpired: true,
          totalSecondsRemaining: 0,
        });
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        setCountdown({
          hours: String(hrs).padStart(2, '0'),
          minutes: String(mins).padStart(2, '0'),
          seconds: String(secs).padStart(2, '0'),
          isExpired: false,
          totalSecondsRemaining: totalSecs,
        });
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [liveData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivePermit();
    setRefreshing(false);
  };

  // Mask phone number: e.g. "9876543210" -> "98******10"
  const maskPhoneNumber = (phone?: string) => {
    if (!phone || phone.length < 6) return phone || '';
    const start = phone.substring(0, 2);
    const end = phone.substring(phone.length - 2);
    const masked = '*'.repeat(Math.max(4, phone.length - 4));
    return `${start}${masked}${end}`;
  };

  const status = (liveData?.status || 'NO_PERMIT').toUpperCase();
  const isExpiredState = status === 'EXPIRED' || (status === 'APPROVED' && countdown.isExpired) || (status === 'ACTIVE' && countdown.isExpired);

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
            <Text style={styles.title}>Live Fishing Permit</Text>
            <Text style={styles.tamilTitle}>நேரடி மீன்பிடி அனுமதி</Text>
            <Text style={styles.subtitle}>Current voyage authorization and crew clearance.</Text>
          </View>

          <TouchableOpacity style={styles.refreshBadge} onPress={onRefresh} activeOpacity={0.7}>
            <MaterialIcons name="sync" size={16} color="#005bb0" />
            <Text style={styles.refreshBadgeText}>Sync</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bb0" />
            <Text style={styles.loadingText}>Fetching live voyage authorization...</Text>
          </View>
        ) : status === 'PENDING' ? (
          /* ========================================================================= */
          /* 1. PENDING APPROVAL VIEW                                                  */
          /* ========================================================================= */
          <View style={styles.pendingCard}>
            <View style={styles.pendingPulseRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.pulseText}>OFFICER VERIFICATION IN PROGRESS</Text>
            </View>

            <View style={styles.pendingIconCircle}>
              <MaterialIcons name="hourglass-top" size={42} color="#d97706" />
            </View>

            <Text style={styles.pendingTitle}>Waiting for Officer Approval</Text>
            <Text style={styles.tamilPendingTitle}>அதிகாரி அனுமதிக்காக காத்திருக்கிறது</Text>
            <Text style={styles.pendingDescription}>
              You have been added to the voyage manifest for vessel{' '}
              <Text style={styles.boldBlueText}>{liveData?.registrationNumber}</Text>. The Harbor Checkpost Officer is verifying crew credentials.
            </Text>

            <View style={styles.pendingDetailsBox}>
              <View style={styles.pendingDetailRow}>
                <Text style={styles.pendingLabel}>Vessel Name:</Text>
                <Text style={styles.pendingValue}>{liveData?.boatName || 'Sea King'}</Text>
              </View>
              <View style={styles.pendingDetailRow}>
                <Text style={styles.pendingLabel}>Boat Owner:</Text>
                <Text style={styles.pendingValue}>{liveData?.ownerName || 'Ramesh'}</Text>
              </View>
              <View style={styles.pendingDetailRow}>
                <Text style={styles.pendingLabel}>Crew Members:</Text>
                <Text style={styles.pendingValueHighlight}>
                  {liveData?.crewMembers?.length || 0} Fishermen Listed
                </Text>
              </View>
            </View>
          </View>
        ) : status === 'REJECTED' ? (
          /* ========================================================================= */
          /* 2. REJECTED PERMIT VIEW                                                   */
          /* ========================================================================= */
          <View style={styles.rejectedCard}>
            <View style={styles.rejectedIconCircle}>
              <MaterialIcons name="cancel" size={44} color="#dc2626" />
            </View>

            <Text style={styles.rejectedTitle}>Voyage Clearance Rejected</Text>
            <Text style={styles.tamilRejectedTitle}>அனுமதி விண்ணப்பம் நிராகரிக்கப்பட்டது</Text>

            <View style={styles.rejectionReasonCard}>
              <Text style={styles.reasonHeaderTitle}>OFFICER REMARKS</Text>
              <Text style={styles.reasonBodyText}>
                The vessel application was not approved by the harbor post officer. Please contact your vessel owner for updated clearance.
              </Text>
            </View>
          </View>
        ) : isExpiredState ? (
          /* ========================================================================= */
          /* 3. EXPIRED PERMIT VIEW                                                    */
          /* ========================================================================= */
          <View style={styles.expiredCard}>
            <View style={styles.expiredIconCircle}>
              <MaterialIcons name="timer-off" size={44} color="#64748b" />
            </View>

            <Text style={styles.expiredTitle}>24-Hour Permit Expired</Text>
            <Text style={styles.tamilExpiredTitle}>அனுமதி காலம் முடிவடைந்தது</Text>
            <Text style={styles.expiredDesc}>
              Your previous voyage clearance for vessel{' '}
              <Text style={styles.boldBlueText}>{liveData?.registrationNumber}</Text>{' '}
              has completed its 24-hour validity period.
            </Text>

            <View style={styles.expiredDetailsBox}>
              <View style={styles.expiredRow}>
                <Text style={styles.expiredLabel}>Permit Token:</Text>
                <Text style={styles.expiredValue}>{liveData?.permitNumber || 'TN-FP-EXPIRED'}</Text>
              </View>
              <View style={styles.expiredRow}>
                <Text style={styles.expiredLabel}>Expired At:</Text>
                <Text style={styles.expiredValue}>{liveData?.expiryTime || 'Past Validity'}</Text>
              </View>
            </View>
          </View>
        ) : !liveData || !liveData.hasActivePermit || status === 'NO_PERMIT' ? (
          /* ========================================================================= */
          /* 4. NO PERMIT VIEW                                                         */
          /* ========================================================================= */
          <View style={styles.noPermitCard}>
            <View style={styles.noPermitIconCircle}>
              <MaterialIcons name="sailing" size={42} color="#005bb0" />
            </View>
            <Text style={styles.noPermitTitle}>No Active Permit</Text>
            <Text style={styles.tamilNoPermitTitle}>செயலில் உள்ள அனுமதி இல்லை</Text>
            <Text style={styles.noPermitSubtitle}>
              You are not currently assigned to any active voyage clearance. Once a registered vessel owner adds you to today's permit manifest, details will display here.
            </Text>
          </View>
        ) : (
          /* ========================================================================= */
          /* 5. APPROVED & ACTIVE LIVE PERMIT PASS VIEW                                */
          /* ========================================================================= */
          <>
            {/* 24-Hour Countdown Clock Banner */}
            <View style={styles.countdownBanner}>
              <View style={styles.timerHeaderRow}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveGreenDot} />
                  <Text style={styles.liveIndicatorText}>ACTIVE 24-HOUR PERMIT</Text>
                </View>
                <Text style={styles.timerSubtitle}>Time Remaining</Text>
              </View>

              {/* Digital LED Clock Boxes */}
              <View style={styles.clockContainer}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeNumber}>{countdown.hours}</Text>
                  <Text style={styles.timeLabel}>HOURS</Text>
                </View>
                <Text style={styles.clockColon}>:</Text>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeNumber}>{countdown.minutes}</Text>
                  <Text style={styles.timeLabel}>MINUTES</Text>
                </View>
                <Text style={styles.clockColon}>:</Text>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeNumber}>{countdown.seconds}</Text>
                  <Text style={styles.timeLabel}>SECONDS</Text>
                </View>
              </View>

              <Text style={styles.expiryNote}>Expires: {liveData?.expiryTime || '24h from approval'}</Text>
            </View>

            <View style={styles.largePermitCard}>
              {/* Status Header Banner */}
              <View style={styles.statusBanner}>
                <View style={styles.statusDotGreen} />
                <Text style={styles.statusBannerText}>ACTIVE / APPROVED PERMIT</Text>
              </View>

              {/* Boat Title & Registration */}
              <View style={styles.boatTitleRow}>
                <Text style={styles.boatLabel}>ASSIGNED VESSEL</Text>
                <Text style={styles.boatName}>{liveData.boatName || 'Sea King'}</Text>
              </View>

              {/* Vessel Registration Highlight Box */}
              <View style={styles.regNumberBox}>
                <Text style={styles.regNumberLabel}>REGISTRATION NUMBER</Text>
                <Text style={styles.regNumberValue}>{liveData.registrationNumber}</Text>
              </View>

              <View style={styles.divider} />

              {/* Key Details Grid */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Registered Owner</Text>
                  <Text style={styles.detailValue}>{liveData.ownerName || 'Ramesh'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Permit Number</Text>
                  <Text style={styles.detailValueHighlight}>{liveData.permitNumber}</Text>
                </View>
              </View>

              {/* Dual-Pane Voyage Validity Timeline */}
              <View style={styles.datesContainer}>
                <View style={styles.dateCol}>
                  <View style={styles.dateHeaderRow}>
                    <MaterialIcons name="event-available" size={13} color="#64748b" />
                    <Text style={styles.dateLabel}>ISSUED AT</Text>
                  </View>
                  <Text style={styles.dateValue}>{liveData.issuedTime || 'Today'}</Text>
                </View>

                <View style={styles.dateDivider} />

                <View style={styles.dateCol}>
                  <View style={styles.dateHeaderRow}>
                    <MaterialIcons name="event-busy" size={13} color="#64748b" />
                    <Text style={styles.dateLabel}>VALID UNTIL</Text>
                  </View>
                  <Text style={styles.dateValue}>{liveData.expiryTime || '24 Hours'}</Text>
                </View>
              </View>

              {/* Crew Members List */}
              {liveData.crewMembers && liveData.crewMembers.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.crewSectionHeader}>
                    <View style={styles.crewHeaderTitleRow}>
                      <MaterialCommunityIcons name="account-group" size={20} color="#005bb0" />
                      <Text style={styles.crewSectionTitle}>Authorized Crew Manifest</Text>
                    </View>
                    <View style={styles.crewCountPill}>
                      <Text style={styles.crewCountPillText}>
                        {liveData.crewMembers.length} Members
                      </Text>
                    </View>
                  </View>

                  <View style={styles.crewList}>
                    {liveData.crewMembers.map((member, index) => (
                      <View key={member.fishermanId + index} style={styles.crewCardItem}>
                        <View style={styles.crewAvatarCircle}>
                          <MaterialCommunityIcons name="account-check" size={20} color="#005bb0" />
                        </View>
                        <View style={styles.crewInfo}>
                          <View style={styles.crewNameRow}>
                            <Text style={styles.crewName}>{member.name}</Text>
                            <MaterialIcons name="verified" size={14} color="#16a34a" />
                          </View>
                          <View style={styles.crewMetaRow}>
                            <Text style={styles.crewIdBadge}>{member.fishermanId}</Text>
                            {member.phoneNumber ? (
                              <Text style={styles.crewPhone}>{maskPhoneNumber(member.phoneNumber)}</Text>
                            ) : null}
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </>
        )}

        {/* Coastal Safety Note */}
        <View style={styles.safetyFooter}>
          <MaterialIcons name="security" size={14} color="#64748b" />
          <Text style={styles.safetyFooterText}>
            Authorized under Tamil Nadu Marine Fisheries Regulation Act
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
  refreshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 4,
  },
  refreshBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
  boldBlueText: {
    color: '#005bb0',
    fontWeight: '800',
  },

  // 1. Pending View
  pendingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
    marginBottom: 20,
  },
  pendingPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d97706',
  },
  pulseText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.4,
  },
  pendingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  tamilPendingTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textAlign: 'center',
  },
  pendingDescription: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  pendingDetailsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  pendingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  pendingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  pendingValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#005bb0',
  },

  // 2. Rejected View
  rejectedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
    marginBottom: 20,
  },
  rejectedIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  rejectedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#991b1b',
    textAlign: 'center',
    marginBottom: 2,
  },
  tamilRejectedTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7f1d1d',
    marginBottom: 16,
    textAlign: 'center',
  },
  rejectionReasonCard: {
    width: '100%',
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  reasonHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991b1b',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  reasonBodyText: {
    fontSize: 12.5,
    color: '#7f1d1d',
    lineHeight: 18,
  },

  // 3. Expired View
  expiredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 10,
    marginBottom: 20,
  },
  expiredIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  expiredTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 2,
  },
  tamilExpiredTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 10,
    textAlign: 'center',
  },
  expiredDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  expiredDetailsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  expiredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiredLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  expiredValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },

  // 4. Empty State
  noPermitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    marginTop: 10,
    marginBottom: 20,
  },
  noPermitIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  noPermitTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  tamilNoPermitTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 10,
  },
  noPermitSubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },

  // 5. Approved Live View & Countdown
  countdownBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  timerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  liveIndicatorText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#4ade80',
    letterSpacing: 0.5,
  },
  timerSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  timeBlock: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  clockColon: {
    fontSize: 26,
    fontWeight: '900',
    color: '#64748b',
    marginBottom: 12,
  },
  expiryNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },

  // Active Permit Card
  largePermitCard: {
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 14,
    gap: 6,
  },
  statusDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16a34a',
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  boatTitleRow: {
    marginBottom: 10,
  },
  boatLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  boatName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
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
  detailsGrid: {
    gap: 10,
    marginBottom: 14,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13.5,
    color: '#0f172a',
    fontWeight: '700',
  },
  detailValueHighlight: {
    fontSize: 13.5,
    color: '#005bb0',
    fontWeight: '800',
  },

  // Dates Container
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 6,
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

  // Crew Manifest
  crewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  crewHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crewSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  crewCountPill: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  crewCountPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#005bb0',
  },
  crewList: {
    gap: 8,
  },
  crewCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  crewAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewInfo: {
    flex: 1,
  },
  crewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  crewName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  crewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  crewIdBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#005bb0',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  crewPhone: {
    fontSize: 11,
    color: '#64748b',
  },

  // Safety Footer
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
