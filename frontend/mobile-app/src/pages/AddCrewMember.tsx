import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  searchFishermen,
  FishermanSearchResult,
} from '../services/api';

interface AddCrewMemberProps {
  registrationNumber?: string;
  initialCrew?: FishermanSearchResult[];
  onBack?: () => void;
  onDone?: (selectedCrew: FishermanSearchResult[]) => void;
  onSuccess?: () => void;
}

export default function AddCrewMember(props: AddCrewMemberProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ registrationNumber?: string }>();
  const registrationNumber =
    searchParams.registrationNumber || props.registrationNumber || 'TN-09-MM-1234';

  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FishermanSearchResult[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<FishermanSearchResult[]>(
    props.initialCrew || []
  );
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animated dropdown opacity
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Mask phone number: e.g. "9876543210" -> "98******10"
  const maskPhoneNumber = (phone?: string) => {
    if (!phone || phone.length < 6) return phone || '';
    const start = phone.substring(0, 2);
    const end = phone.substring(phone.length - 2);
    const masked = '*'.repeat(Math.max(4, phone.length - 4));
    return `${start}${masked}${end}`;
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      hideDropdownAnimated();
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchFishermen(searchQuery);
      setSearchResults(results);
      setSearching(false);
      showDropdownAnimated();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showDropdownAnimated = () => {
    setShowDropdown(true);
    Animated.timing(dropdownAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideDropdownAnimated = () => {
    Animated.timing(dropdownAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowDropdown(false);
    });
  };

  const handleSelectFisherman = (fisherman: FishermanSearchResult) => {
    const isAlreadyAdded = selectedCrew.some(
      (item) => item.fishermanId.toUpperCase() === fisherman.fishermanId.toUpperCase()
    );

    if (isAlreadyAdded) {
      Alert.alert('Duplicate Member', 'This fisherman has already been added to the crew list.');
      return;
    }

    setSelectedCrew((prev) => [...prev, fisherman]);
    setSearchQuery('');
    setSearchResults([]);
    hideDropdownAnimated();
  };

  const handleRemoveCrewMember = (fishermanId: string) => {
    setSelectedCrew((prev) =>
      prev.filter((item) => item.fishermanId.toUpperCase() !== fishermanId.toUpperCase())
    );
  };

  const handleDone = () => {
    if (selectedCrew.length === 0) {
      Alert.alert('Crew Required', 'Please add at least one registered crew member to proceed.');
      return;
    }

    if (props.onDone) {
      props.onDone(selectedCrew);
    } else {
      router.push({
        pathname: '/PermitReview' as any,
        params: {
          registrationNumber,
          crewData: JSON.stringify(selectedCrew),
        },
      });
    }
  };

  const handleGoBack = () => {
    if (props.onBack) {
      props.onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Bar Navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={22} color="#005bb0" />
          </TouchableOpacity>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Crew Manifest</Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + Math.max(insets.bottom, 16) },
          ]}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Add Crew Members</Text>
            <Text style={styles.tamilTitle}>குழு உறுப்பினர்களைச் சேர்க்கவும்</Text>
            <Text style={styles.subtitle}>
              Search registered fishermen by ID to verify identity and assign to today's voyage manifest.
            </Text>
          </View>

          {/* Registration Info Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIconBox}>
              <MaterialIcons name="directions-boat" size={20} color="#005bb0" />
            </View>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerLabel}>ASSIGNING CREW TO VESSEL</Text>
              <Text style={styles.bannerValue}>{registrationNumber}</Text>
            </View>
          </View>

          {/* Search Box Section */}
          <View style={styles.searchSection}>
            <Text style={styles.searchLabel}>Search Fisherman by ID or Name</Text>

            <TouchableWithoutFeedback onPress={() => searchInputRef.current?.focus()}>
              <View style={[styles.searchInputContainer, isFocused && styles.searchInputContainerFocused]}>
                <MaterialIcons
                  name="search"
                  size={22}
                  color={isFocused ? '#005bb0' : '#64748b'}
                  style={styles.searchIcon}
                />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="e.g. FSH123456 or Name"
                  placeholderTextColor="#94a3b8"
                  value={searchQuery}
                  onChangeText={(text) => setSearchQuery(text.toUpperCase())}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  selectionColor="#005bb0"
                  underlineColorAndroid="transparent"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  returnKeyType="search"
                />
                {searching && (
                  <ActivityIndicator size="small" color="#005bb0" style={{ marginRight: 8 }} />
                )}
                {searchQuery.length > 0 && !searching && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <MaterialIcons name="cancel" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>

            {/* Dropdown Container */}
            {showDropdown && searchQuery.trim().length > 0 && (
              <Animated.View style={[styles.dropdown, { opacity: dropdownAnim }]}>
                {searching ? (
                  <View style={styles.dropdownLoading}>
                    <ActivityIndicator size="small" color="#005bb0" />
                    <Text style={styles.dropdownLoadingText}>Searching verified database...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item, index) => (
                    <TouchableOpacity
                      key={item.fishermanId || index}
                      style={styles.dropdownItem}
                      onPress={() => handleSelectFisherman(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.dropdownItemContent}>
                        <View style={styles.dropdownAvatarCircle}>
                          <MaterialCommunityIcons name="account-tie-hat" size={20} color="#005bb0" />
                        </View>
                        <View style={styles.dropdownDetails}>
                          <Text style={styles.fishermanName}>{item.name}</Text>
                          <View style={styles.metaRow}>
                            <Text style={styles.metaPill}>{item.fishermanId}</Text>
                            <Text style={styles.metaPhone}>{maskPhoneNumber(item.phoneNumber)}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.addMemberBtn}>
                        <MaterialIcons name="add" size={18} color="#ffffff" />
                        <Text style={styles.addMemberBtnText}>Add</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyDropdown}>
                    <MaterialIcons name="search-off" size={28} color="#94a3b8" />
                    <Text style={styles.emptyText}>No registered fisherman found</Text>
                    <Text style={styles.emptySubtext}>Check ID spelling or contact fisheries office.</Text>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          {/* Selected Crew List */}
          <View style={styles.crewListSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Selected Crew Manifest</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{selectedCrew.length}</Text>
                </View>
              </View>

              {selectedCrew.length > 0 && (
                <TouchableOpacity onPress={() => setSelectedCrew([])} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedCrew.length === 0 ? (
              <View style={styles.noCrewCard}>
                <View style={styles.noCrewIconCircle}>
                  <MaterialIcons name="group-add" size={32} color="#005bb0" />
                </View>
                <Text style={styles.noCrewTitle}>No crew members added yet</Text>
                <Text style={styles.noCrewSubtitle}>
                  Search by Fisherman ID above and tap "Add" to include verified crew in today's manifest.
                </Text>
              </View>
            ) : (
              selectedCrew.map((crewMember) => (
                <View key={crewMember.fishermanId} style={styles.crewCard}>
                  <View style={styles.crewCardLeft}>
                    <View style={styles.crewAvatar}>
                      <MaterialCommunityIcons name="account-check" size={22} color="#005bb0" />
                    </View>
                    <View style={styles.crewInfo}>
                      <View style={styles.crewNameRow}>
                        <Text style={styles.crewName}>{crewMember.name}</Text>
                        <MaterialIcons name="verified" size={14} color="#16a34a" />
                      </View>
                      <Text style={styles.crewId}>ID: {crewMember.fishermanId}</Text>
                      {crewMember.phoneNumber ? (
                        <Text style={styles.crewPhone}>
                          Phone: {maskPhoneNumber(crewMember.phoneNumber)}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveCrewMember(crewMember.fishermanId)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="close" size={16} color="#dc2626" />
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Sticky Bottom Action Bar */}
        <View
          style={[
            styles.bottomFooter,
            {
              paddingBottom: Math.max(insets.bottom + 12, 20),
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.applyButton, selectedCrew.length === 0 && styles.disabledButton]}
            onPress={handleDone}
            disabled={selectedCrew.length === 0}
          >
            <Text style={styles.applyButtonText}>
              {selectedCrew.length === 0
                ? 'Add at Least 1 Crew Member'
                : `Proceed to Review (${selectedCrew.length} Crew)`}
            </Text>
            {selectedCrew.length > 0 && (
              <MaterialIcons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 16,
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d0e1fd',
    marginBottom: 18,
    gap: 12,
  },
  bannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  bannerValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#005bb0',
    letterSpacing: 0.5,
  },
  searchSection: {
    marginBottom: 20,
    zIndex: 10,
  },
  searchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    height: 52,
  },
  searchInputContainerFocused: {
    borderColor: '#005bb0',
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d0e1fd',
    marginTop: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    maxHeight: 280,
    overflow: 'hidden',
  },
  dropdownLoading: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  dropdownLoadingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  dropdownAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownDetails: {
    flex: 1,
  },
  fishermanName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005bb0',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaPhone: {
    fontSize: 11.5,
    color: '#64748b',
  },
  addMemberBtn: {
    backgroundColor: '#005bb0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  addMemberBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyDropdown: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  crewListSection: {
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  countBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#005bb0',
  },
  clearAllText: {
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '700',
  },
  noCrewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  noCrewIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  noCrewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  noCrewSubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  crewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  crewCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  crewAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  crewId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005bb0',
    marginTop: 2,
  },
  crewPhone: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 2,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
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
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 99,
  },
  applyButton: {
    backgroundColor: '#005bb0',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
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
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
