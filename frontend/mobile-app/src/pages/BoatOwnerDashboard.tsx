import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  getBoatOwnerProfile,
  getApplicationStatus,
  getLivePermit,
  BoatProfileResponse,
  LivePermitData,
} from '../services/api';

interface BoatOwnerDashboardProps {
  registrationNumber?: string;
  onAddCrew?: () => void;
  onViewLivePermit?: () => void;
}

export default function BoatOwnerDashboard(props: BoatOwnerDashboardProps) {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ registrationNumber?: string }>();

  const regNumParam = searchParams.registrationNumber || props.registrationNumber || '';
  const [profile, setProfile] = useState<BoatProfileResponse | null>(null);
  const [livePermit, setLivePermit] = useState<LivePermitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (regNum?: string) => {
    const targetReg = regNum || regNumParam;
    const [profileData, permitData] = await Promise.all([
      getBoatOwnerProfile(targetReg),
      getLivePermit(targetReg),
    ]);

    if (profileData) {
      setProfile(profileData);
    } else {
      setProfile({
        boatName: 'Sea King',
        registrationNumber: targetReg || 'TN-09-MM-1234',
        ownerName: 'Ramesh',
        date: '2026-08-16',
      });
    }

    setLivePermit(permitData);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchData(regNumParam);
  }, [regNumParam]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(regNumParam);
    setRefreshing(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '16 Aug 2026';
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return dateStr;
      return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getPermitBadge = () => {
    const status = (livePermit?.status || 'NO_PERMIT').toUpperCase();

    if (status === 'APPROVED' || status === 'ACTIVE') {
      return {
        label: 'Active 24h Permit',
        bg: '#e8f8f0',
        color: '#16a34a',
        border: '#b8ebd0',
        icon: 'verified' as keyof typeof MaterialIcons.glyphMap,
      };
    }
    if (status === 'PENDING' || status === 'PENDING APPROVAL') {
      return {
        label: 'Pending Approval',
        bg: '#fffbeb',
        color: '#d97706',
        border: '#fde68a',
        icon: 'hourglass-empty' as keyof typeof MaterialIcons.glyphMap,
      };
    }
    if (status === 'REJECTED') {
      return {
        label: 'Permit Rejected',
        bg: '#fef2f2',
        color: '#dc2626',
        border: '#fca5a5',
        icon: 'cancel' as keyof typeof MaterialIcons.glyphMap,
      };
    }
    if (status === 'EXPIRED') {
      return {
        label: 'Permit Expired',
        bg: '#f1f5f9',
        color: '#64748b',
        border: '#cbd5e1',
        icon: 'timer-off' as keyof typeof MaterialIcons.glyphMap,
      };
    }
    return {
      label: 'No Active Permit',
      bg: '#f0f4fd',
      color: '#005bb0',
      border: '#c0d7ff',
      icon: 'info' as keyof typeof MaterialIcons.glyphMap,
    };
  };

  const handleAddCrew = async () => {
    try {
      const statusRes = await getApplicationStatus();
      if (!statusRes.permitApplicationOpen) {
        Alert.alert(
          statusRes.title || 'Permit Closed',
          statusRes.message || "Today's fishing permit applications are currently closed. Please try again later."
        );
        return;
      }
    } catch (e) {
      console.error('Status check error:', e);
    }

    const status = (livePermit?.status || 'NO_PERMIT').toUpperCase();

    if (status === 'PENDING') {
      Alert.alert(
        'Application Pending',
        'You already have a fishing permit application pending officer approval. Please wait for the officer\'s decision.'
      );
      return;
    }

    if (status === 'APPROVED' || status === 'ACTIVE') {
      Alert.alert(
        'Active Permit in Progress',
        'You already have an active valid fishing permit. A new permit application cannot be submitted while one is active.'
      );
      return;
    }

    if (props.onAddCrew) {
      props.onAddCrew();
    } else {
      router.push({
        pathname: '/AddCrewMember',
        params: { registrationNumber: profile?.registrationNumber || regNumParam },
      } as any);
    }
  };

  const handleViewLivePermit = () => {
    if (props.onViewLivePermit) {
      props.onViewLivePermit();
    } else {
      router.push({
        pathname: '/LivePermit',
        params: { registrationNumber: profile?.registrationNumber || regNumParam },
      } as any);
    }
  };

  const badge = getPermitBadge();
  const permitStatus = (livePermit?.status || 'NO_PERMIT').toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#005bb0']} />
        }
      >
        {/* Government Portal Header */}
        <View style={styles.header}>
          <View style={styles.govTagRow}>
            <View style={styles.govTag}>
              <Text style={styles.govTagText}>TAMIL NADU FISHERIES DEPT</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(profile?.date)}</Text>
          </View>

          <View style={styles.titleRow}>
            <MaterialIcons name="directions-boat" size={28} color="#005bb0" />
            <Text style={styles.headerTitle}>Boat Owner Dashboard</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Manage registered vessel information, crew manifests & departure permits
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bb0" />
            <Text style={styles.loadingText}>Loading vessel details...</Text>
          </View>
        ) : (
          <>
            {/* Digital Vessel Certificate Card (mParivahan / DigiLocker Style) */}
            <View style={styles.vesselCard}>
              <View style={styles.vesselCardTop}>
                <View style={styles.vesselTitleWrap}>
                  <Text style={styles.vesselTypeLabel}>REGISTERED FISHING VESSEL</Text>
                  <Text style={styles.vesselName}>{profile?.boatName || 'Sea King'}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: badge.bg, borderColor: badge.border },
                  ]}
                >
                  <MaterialIcons name={badge.icon} size={14} color={badge.color} />
                  <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              {/* Registration Number Prominent Box */}
              <View style={styles.regNumberBox}>
                <Text style={styles.regNumberLabel}>REGISTRATION NUMBER</Text>
                <Text style={styles.regNumberValue}>
                  {profile?.registrationNumber || 'TN-09-MM-1234'}
                </Text>
              </View>

              {/* Details Grid */}
              <View style={styles.vesselDetailsGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconBox}>
                    <MaterialIcons name="person" size={20} color="#005bb0" />
                  </View>
                  <View>
                    <Text style={styles.detailItemLabel}>Registered Owner</Text>
                    <Text style={styles.detailItemValue}>{profile?.ownerName || 'Ramesh'}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIconBox}>
                    <MaterialIcons name="anchor" size={20} color="#005bb0" />
                  </View>
                  <View>
                    <Text style={styles.detailItemLabel}>Base Harbor</Text>
                    <Text style={styles.detailItemValue}>Rameswaram Port</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Primary Action Button: + Add Crew Member */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addCrewButton}
              onPress={handleAddCrew}
            >
              <View style={styles.addCrewIconCircle}>
                <MaterialIcons name="group-add" size={24} color="#005bb0" />
              </View>
              <View style={styles.addCrewTextWrap}>
                <Text style={styles.addCrewButtonTitle}>+ Add Crew Member</Text>
                <Text style={styles.addCrewButtonSubtitle}>Submit crew manifest for 24h voyage permit</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Live Permit Details Card */}
            <View style={styles.livePermitCard}>
              <View style={styles.livePermitCardHeader}>
                <View style={styles.livePermitTitleRow}>
                  <MaterialCommunityIcons name="sail-boat" size={22} color="#005bb0" />
                  <Text style={styles.livePermitTitle}>Live Permit Details</Text>
                </View>
                <View
                  style={[
                    styles.permitStatusChip,
                    { backgroundColor: badge.bg, borderColor: badge.border },
                  ]}
                >
                  <Text style={[styles.permitStatusChipText, { color: badge.color }]}>
                    {badge.label}
                  </Text>
                </View>
              </View>

              <View style={styles.livePermitDivider} />

              {permitStatus === 'APPROVED' || permitStatus === 'ACTIVE' ? (
                /* Approved / Active Live Permit Summary */
                <View style={styles.permitDetailsBody}>
                  <View style={styles.permitDetailRow}>
                    <Text style={styles.permitDetailLabel}>Permit Number:</Text>
                    <Text style={styles.permitDetailHighlight}>{livePermit?.permitNumber}</Text>
                  </View>
                  <View style={styles.permitDetailRow}>
                    <Text style={styles.permitDetailLabel}>Valid Expiry:</Text>
                    <Text style={styles.permitDetailValue}>{livePermit?.expiryTime}</Text>
                  </View>
                  <View style={styles.permitDetailRow}>
                    <Text style={styles.permitDetailLabel}>Crew Manifest:</Text>
                    <Text style={styles.permitDetailValue}>
                      {livePermit?.crewMembers?.length || 0} Crew Members Verified
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewLivePermitBtn}
                    onPress={handleViewLivePermit}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="qr-code-2" size={20} color="#ffffff" />
                    <Text style={styles.viewLivePermitBtnText}>View Live Permit & QR Pass</Text>
                  </TouchableOpacity>
                </View>
              ) : permitStatus === 'PENDING' || permitStatus === 'PENDING APPROVAL' ? (
                /* Pending Approval Summary */
                <View style={styles.permitDetailsBody}>
                  <View style={styles.pendingNoticeWrap}>
                    <MaterialIcons name="hourglass-top" size={20} color="#d97706" />
                    <Text style={styles.pendingNoticeText}>
                      Application pending officer verification at harbor post.
                    </Text>
                  </View>
                  <View style={styles.permitDetailRow}>
                    <Text style={styles.permitDetailLabel}>Submitted At:</Text>
                    <Text style={styles.permitDetailValue}>{livePermit?.issuedTime || 'Just now'}</Text>
                  </View>
                  <View style={styles.permitDetailRow}>
                    <Text style={styles.permitDetailLabel}>Crew Submitted:</Text>
                    <Text style={styles.permitDetailValue}>
                      {livePermit?.crewMembers?.length || 0} Members
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.viewLivePermitBtn, { backgroundColor: '#d97706' }]}
                    onPress={handleViewLivePermit}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="visibility" size={18} color="#ffffff" />
                    <Text style={styles.viewLivePermitBtnText}>View Pending Verification</Text>
                  </TouchableOpacity>
                </View>
              ) : permitStatus === 'REJECTED' ? (
                /* Rejected Summary */
                <View style={styles.permitDetailsBody}>
                  <View style={styles.rejectedReasonBox}>
                    <Text style={styles.rejectedReasonLabel}>Rejection Reason:</Text>
                    <Text style={styles.rejectedReasonText}>
                      {livePermit?.rejectionReason || 'Did not meet maritime safety guidelines.'}
                    </Text>
                  </View>
                  <Text style={styles.rejectedHelperText}>
                    You can immediately apply for a new permit with updated crew details.
                  </Text>

                  <TouchableOpacity
                    style={[styles.viewLivePermitBtn, { backgroundColor: '#dc2626' }]}
                    onPress={handleViewLivePermit}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="info-outline" size={18} color="#ffffff" />
                    <Text style={styles.viewLivePermitBtnText}>View Rejection Details</Text>
                  </TouchableOpacity>
                </View>
              ) : permitStatus === 'EXPIRED' ? (
                /* Expired Summary */
                <View style={styles.permitDetailsBody}>
                  <Text style={styles.expiredHelperText}>
                    Your previous 24-hour permit has expired. Submit a new crew manifest to obtain fresh clearance.
                  </Text>

                  <TouchableOpacity
                    style={[styles.viewLivePermitBtn, { backgroundColor: '#475569' }]}
                    onPress={handleViewLivePermit}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="history" size={18} color="#ffffff" />
                    <Text style={styles.viewLivePermitBtnText}>View Expired Permit</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* No Permit Summary */
                <View style={styles.permitDetailsBody}>
                  <Text style={styles.noPermitHelperText}>
                    No active fishing permit issued for this vessel. Add crew members above to apply.
                  </Text>

                  <TouchableOpacity
                    style={[styles.viewLivePermitBtn, { backgroundColor: '#005bb0' }]}
                    onPress={handleAddCrew}
                    activeOpacity={0.85}
                  >
                    <MaterialIcons name="add-circle-outline" size={18} color="#ffffff" />
                    <Text style={styles.viewLivePermitBtnText}>Apply For New Permit</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    paddingTop: 12,
    paddingBottom: 28,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 20,
  },
  govTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  govTag: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  govTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#005bb0',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },

  // Digital Vessel Certificate Card (mParivahan Style)
  vesselCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  vesselCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  vesselTitleWrap: {
    flex: 1,
  },
  vesselTypeLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#005bb0',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  vesselName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  regNumberBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  regNumberLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  regNumberValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#005bb0',
    letterSpacing: 1,
  },
  vesselDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 1,
  },
  detailItemValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },

  // Primary Action Button
  addCrewButton: {
    backgroundColor: '#005bb0',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginBottom: 20,
    gap: 12,
  },
  addCrewIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCrewTextWrap: {
    flex: 1,
  },
  addCrewButtonTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  addCrewButtonSubtitle: {
    color: '#d0e1fd',
    fontSize: 11.5,
    fontWeight: '500',
  },

  // Live Permit Details Card
  livePermitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 24,
  },
  livePermitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livePermitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePermitTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  permitStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  permitStatusChipText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  livePermitDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  permitDetailsBody: {
    gap: 10,
  },
  permitDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  permitDetailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  permitDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  permitDetailHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#005bb0',
  },
  pendingNoticeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 4,
  },
  pendingNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 17,
  },
  rejectedReasonBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 2,
  },
  rejectedReasonLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991b1b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  rejectedReasonText: {
    fontSize: 13,
    color: '#7f1d1d',
    fontWeight: '600',
    lineHeight: 18,
  },
  rejectedHelperText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginVertical: 2,
  },
  expiredHelperText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginVertical: 2,
  },
  noPermitHelperText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginVertical: 2,
  },
  viewLivePermitBtn: {
    backgroundColor: '#005bb0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewLivePermitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
