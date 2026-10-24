import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface RoleSelectionProps {
  onSelectRole?: (role: 'boat_owner' | 'fisherman') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const router = useRouter();

  const handleSelectBoatOwner = () => {
    if (onSelectRole) {
      onSelectRole('boat_owner');
    } else {
      try {
        router.push('/BoatLogin' as any);
      } catch {
        // Fallback
      }
    }
  };

  const handleSelectFisherman = () => {
    if (onSelectRole) {
      onSelectRole('fisherman');
    } else {
      try {
        router.push('/FishermanLogin' as any);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Government Branding & Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.emblemWrapper}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjJY7dzHiG81eFVKeZKUgOSRBZghVD_KOSUieN8JP56ePceAp3de3H1-MYilrJlEethAt1henHfD5vbE5xR3OE4T7FPpCZHU5GUoS5DM9Xll35CRFLXUZ5eT_E5VnQbYykbB43BtXukBWFp6V5G9bo_gSTlID_7PHykHW5VcwudNeapRyDTRX34K3oWX46urZm74O3JpKglCYVE-wwnp1St2BcslW9mnofnWErLwq16i8LHJX5r1ED',
              }}
              style={styles.emblem}
              resizeMode="contain"
            />
          </View>

          <View style={styles.govBadge}>
            <Text style={styles.govBadgeTamil}>தமிழ்நாடு அரசு</Text>
            <Text style={styles.govBadgeDivider}>•</Text>
            <Text style={styles.govBadgeEng}>GOVERNMENT OF TAMIL NADU</Text>
          </View>

          <Text style={styles.title}>Daily Fishing Permit System</Text>
          <Text style={styles.subtitle}>
            Department of Fisheries and Fishermen Welfare
          </Text>
          <Text style={styles.instruction}>
            Select your role to access digital tokens and voyage clearances
          </Text>
        </View>

        {/* Role Cards Container */}
        <View style={styles.cardsContainer}>
          {/* Boat Owner Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.card, styles.boatCard]}
            onPress={handleSelectBoatOwner}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, styles.boatIconContainer]}>
                <MaterialIcons name="directions-boat" size={30} color="#005bb0" />
              </View>

              <View style={styles.cardTitleWrap}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.cardTitle}>Boat Owner</Text>
                  <View style={styles.boatPill}>
                    <Text style={styles.boatPillText}>Boat Reg. No.</Text>
                  </View>
                </View>
                <Text style={styles.roleTamil}>படகு உரிமையாளர்</Text>
              </View>
            </View>

            <Text style={styles.cardDescription}>
              Manage daily fishing permits, verify biometric crew manifest, and download official 24-hour departure passes.
            </Text>

            <View style={styles.cardFooterAction}>
              <Text style={styles.boatActionText}>Login as Boat Owner</Text>
              <View style={[styles.actionCircle, styles.boatActionCircle]}>
                <MaterialIcons name="arrow-forward" size={18} color="#005bb0" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Fisherman Card */}
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.card, styles.fishermanCard]}
            onPress={handleSelectFisherman}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconContainer, styles.fishermanIconContainer]}>
                <MaterialCommunityIcons name="account-tie-hat" size={30} color="#0d6efd" />
              </View>

              <View style={styles.cardTitleWrap}>
                <View style={styles.roleHeaderRow}>
                  <Text style={styles.cardTitle}>Fisherman</Text>
                  <View style={styles.fishermanPill}>
                    <Text style={styles.fishermanPillText}>Fisherman ID</Text>
                  </View>
                </View>
                <Text style={styles.roleTamil}>மீனவர் உறுப்பினர்</Text>
              </View>
            </View>

            <Text style={styles.cardDescription}>
              View assigned boat permits, verify departure schedules, and access valid harbor voyage clearances.
            </Text>

            <View style={styles.cardFooterAction}>
              <Text style={styles.fishermanActionText}>Login as Fisherman</Text>
              <View style={[styles.actionCircle, styles.fishermanActionCircle]}>
                <MaterialIcons name="arrow-forward" size={18} color="#005bb0" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security & Official Trust Badge Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.securityRow}>
            <MaterialIcons name="verified-user" size={15} color="#0284c7" />
            <Text style={styles.securityText}>Official Coastal Marine Security & OTP Verified</Text>
          </View>
          <Text style={styles.footerCopyright}>
            Office of the Assistant Director of Fisheries, Rameswaram
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    marginBottom: 24,
  },
  emblemWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emblem: {
    width: 68,
    height: 68,
  },
  govBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d0e1fd',
    gap: 6,
  },
  govBadgeTamil: {
    fontSize: 11,
    fontWeight: '800',
    color: '#005bb0',
  },
  govBadgeDivider: {
    fontSize: 10,
    color: '#94a3b8',
  },
  govBadgeEng: {
    fontSize: 10,
    fontWeight: '800',
    color: '#005bb0',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // Cards Container
  cardsContainer: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  boatCard: {
    borderColor: '#d0e1fd',
  },
  fishermanCard: {
    borderColor: '#dbeafe',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  boatIconContainer: {
    backgroundColor: '#e8f0fe',
  },
  fishermanIconContainer: {
    backgroundColor: '#eff6ff',
  },
  cardTitleWrap: {
    flex: 1,
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
  },
  roleTamil: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  boatPill: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  boatPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#005bb0',
  },
  fishermanPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  fishermanPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#005bb0',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    marginBottom: 16,
  },
  cardFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  boatActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#005bb0',
  },
  fishermanActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#005bb0',
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boatActionCircle: {
    backgroundColor: '#e8f0fe',
  },
  fishermanActionCircle: {
    backgroundColor: '#e8f0fe',
  },

  // Footer
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7',
  },
  footerCopyright: {
    fontSize: 10.5,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});
