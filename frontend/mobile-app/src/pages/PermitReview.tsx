import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  applyPermit,
  getBoatOwnerProfile,
  getApplicationStatus,
  FishermanSearchResult,
  BoatProfileResponse,
} from '../services/api';

interface PermitReviewProps {
  registrationNumber?: string;
  crewMembers?: FishermanSearchResult[];
  onBack?: () => void;
  onApplySuccess?: () => void;
}

export default function PermitReview(props: PermitReviewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ registrationNumber?: string; crewData?: string }>();

  const registrationNumber =
    searchParams.registrationNumber || props.registrationNumber || 'TN-09-MM-1234';

  const [crewList, setCrewList] = useState<FishermanSearchResult[]>([]);
  const [profile, setProfile] = useState<BoatProfileResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPermitOpen, setIsPermitOpen] = useState(true);
  const [closedNotice, setClosedNotice] = useState<string | null>(null);

  // Mask phone number: e.g. "9876543210" -> "98******10"
  const maskPhoneNumber = (phone?: string) => {
    if (!phone || phone.length < 6) return phone || '';
    const start = phone.substring(0, 2);
    const end = phone.substring(phone.length - 2);
    const masked = '*'.repeat(Math.max(4, phone.length - 4));
    return `${start}${masked}${end}`;
  };

  useEffect(() => {
    // Check global admin application status
    getApplicationStatus().then((statusRes) => {
      if (!statusRes.permitApplicationOpen) {
        setIsPermitOpen(false);
        const msg = statusRes.message || "Today's fishing permit applications are currently closed. Please try again later.";
        setClosedNotice(msg);
        Alert.alert(
          statusRes.title || 'Permit Closed',
          msg,
          [{ text: 'OK' }]
        );
      }
    });

    if (props.crewMembers && props.crewMembers.length > 0) {
      setCrewList(props.crewMembers);
    } else if (searchParams.crewData) {
      try {
        const parsed = JSON.parse(searchParams.crewData);
        if (Array.isArray(parsed)) {
          setCrewList(parsed);
        }
      } catch (e) {
        console.error('Failed to parse crewData:', e);
      }
    }

    getBoatOwnerProfile(registrationNumber).then((data) => {
      if (data) {
        setProfile(data);
      } else {
        setProfile({
          boatName: 'Sea King',
          registrationNumber: registrationNumber,
          ownerName: 'Ramesh',
          date: '2026-08-16',
        });
      }
      setLoading(false);
    });
  }, [registrationNumber, props.crewMembers, searchParams.crewData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '16 Aug 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleGoBack = () => {
    if (props.onBack) {
      props.onBack();
    } else {
      router.back();
    }
  };

  const handleApplyPermit = async () => {
    if (!isPermitOpen) {
      Alert.alert(
        'Permit Closed',
        closedNotice || "Today's fishing permit applications are currently closed. Please try again later."
      );
      return;
    }

    if (crewList.length === 0) {
      Alert.alert('Validation Error', 'At least one crew member is required to apply for a permit.');
      return;
    }

    setSubmitting(true);
    try {
      const crewIds = crewList.map((c) => c.fishermanId);
      const response = await applyPermit(registrationNumber, crewIds);

      if (response.success) {
        Alert.alert(
          'Permit Application Submitted',
          response.message || 'Permit application submitted successfully. It has been routed to the Harbor Officer Post for approval.',
          [
            {
              text: 'View Live Permit Status',
              onPress: () => {
                if (props.onApplySuccess) {
                  props.onApplySuccess();
                }
                try {
                  router.replace({
                    pathname: '/BoatOwnerDashboard',
                    params: { registrationNumber, initialTab: 'live_permit' },
                  } as any);
                } catch {
                  // Fallback
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Submission Error', response.message || 'Failed to submit permit application.');
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || 'An unexpected error occurred while submitting permit.';
      Alert.alert('Submission Error', errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back to crew selection"
        >
          <MaterialIcons name="arrow-back" size={22} color="#005bb0" />
        </TouchableOpacity>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Permit Review</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Review Permit Application</Text>
          <Text style={styles.tamilTitle}>அனுமதி விண்ணப்ப மதிப்பாய்வு</Text>
          <Text style={styles.subtitle}>
            Please review the vessel details and crew manifest before submitting for officer authorization.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bb0" />
            <Text style={styles.loadingText}>Loading review details...</Text>
          </View>
        ) : (
          <>
            {/* Vessel Summary Card (Digital Certificate Style) */}
            <View style={styles.vesselCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBox}>
                  <MaterialIcons name="directions-boat" size={22} color="#005bb0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardCategoryLabel}>VESSEL DETAILS</Text>
                  <Text style={styles.cardTitle}>{profile?.boatName || 'Sea King'}</Text>
                </View>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{formatDate(profile?.date)}</Text>
                </View>
              </View>

              <View style={styles.regNumberBox}>
                <Text style={styles.regNumberLabel}>REGISTRATION NUMBER</Text>
                <Text style={styles.regNumberValue}>
                  {profile?.registrationNumber || registrationNumber}
                </Text>
              </View>

              <View style={styles.infoRowGrid}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoColLabel}>Owner Name</Text>
                  <Text style={styles.infoColValue}>{profile?.ownerName || 'Ramesh'}</Text>
                </View>
                <View style={styles.infoColDivider} />
                <View style={styles.infoCol}>
                  <Text style={styles.infoColLabel}>Base Harbor</Text>
                  <Text style={styles.infoColValue}>Rameswaram Post</Text>
                </View>
              </View>
            </View>

            {/* Crew Members Manifest Card */}
            <View style={styles.crewCardContainer}>
              <View style={styles.crewHeaderRow}>
                <View style={styles.crewHeaderLeft}>
                  <MaterialCommunityIcons name="account-group" size={22} color="#005bb0" />
                  <Text style={styles.crewHeaderTitle}>Crew Manifest</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{crewList.length} Verified</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {crewList.length === 0 ? (
                <View style={styles.emptyCrewBox}>
                  <MaterialIcons name="info-outline" size={24} color="#94a3b8" />
                  <Text style={styles.emptyCrewText}>No crew members selected for this voyage.</Text>
                </View>
              ) : (
                crewList.map((member, index) => (
                  <View key={member.fishermanId + index} style={styles.crewItemRow}>
                    <View style={styles.crewNumberCircle}>
                      <Text style={styles.crewNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.crewDetails}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <MaterialIcons name="verified" size={14} color="#16a34a" />
                      </View>
                      <View style={styles.memberMetaRow}>
                        <Text style={styles.memberIdBadge}>{member.fishermanId}</Text>
                        {member.phoneNumber ? (
                          <Text style={styles.memberPhone}>{maskPhoneNumber(member.phoneNumber)}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Maritime Compliance Declaration Card */}
            <View style={styles.declarationCard}>
              <MaterialIcons name="verified-user" size={20} color="#0284c7" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.declarationTitle}>Maritime Compliance Declaration</Text>
                <Text style={styles.declarationText}>
                  By submitting, you certify all listed crew members hold valid Tamil Nadu Biometric IDs and adhere to Coastal Security & safety regulations.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Sticky Bottom Actions Bar */}
      <View
        style={[
          styles.bottomFooter,
          {
            paddingBottom: Math.max(insets.bottom + 12, 20),
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.footerBackButton}
          onPress={handleGoBack}
          disabled={submitting}
        >
          <MaterialIcons name="arrow-back" size={18} color="#005bb0" />
          <Text style={styles.footerBackButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.applyButton, (submitting || !isPermitOpen) && styles.disabledButton]}
          onPress={handleApplyPermit}
          disabled={submitting || !isPermitOpen}
        >
          {submitting ? (
            <View style={styles.btnRow}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.applyButtonText}>Submitting...</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.applyButtonText}>
                {!isPermitOpen ? 'Applications Closed' : 'Submit for Approval'}
              </Text>
              {isPermitOpen && (
                <MaterialIcons name="send" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005bb0',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  tamilTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748b',
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },

  // Vessel Card
  vesselCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#005bb0',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  dateBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
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
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  regNumberValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#005bb0',
    letterSpacing: 0.5,
  },
  infoRowGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  infoCol: {
    flex: 1,
  },
  infoColDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  infoColLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 1,
  },
  infoColValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },

  // Crew Card Container
  crewCardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  crewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  crewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crewHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#005bb0',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  emptyCrewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyCrewText: {
    fontSize: 13,
    color: '#64748b',
  },
  crewItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  crewNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  crewNumberText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#005bb0',
  },
  crewDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0f172a',
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  memberIdBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005bb0',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  memberPhone: {
    fontSize: 11.5,
    color: '#64748b',
  },

  // Declaration Card
  declarationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 10,
    marginBottom: 8,
  },
  declarationTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 2,
  },
  declarationText: {
    fontSize: 11.5,
    color: '#3b82f6',
    lineHeight: 16,
  },

  // Bottom Footer Actions
  bottomFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    gap: 12,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    justifyContent: 'center',
    zIndex: 99,
  },
  footerBackButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    maxWidth: 160,
    gap: 6,
  },
  footerBackButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#005bb0',
  },
  applyButton: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#005bb0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 320,
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
});
