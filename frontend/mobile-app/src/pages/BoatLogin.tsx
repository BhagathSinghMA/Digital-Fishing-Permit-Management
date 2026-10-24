import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendBoatOtp } from '../services/api';

interface BoatLoginProps {
  onSendOtp?: (registrationNumber: string) => void;
  onBack?: () => void;
}

export default function BoatLogin({ onSendOtp, onBack }: BoatLoginProps) {
  const router = useRouter();

  // Segmented inputs: IND (fixed) + 4 editable parts
  const [stateCode, setStateCode] = useState('TN');
  const [portCode, setPortCode] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [serialNum, setSerialNum] = useState('');

  const [loading, setLoading] = useState(false);
  const [focusedBox, setFocusedBox] = useState<number | null>(null);

  const input1Ref = useRef<TextInput>(null);
  const input2Ref = useRef<TextInput>(null);
  const input3Ref = useRef<TextInput>(null);
  const input4Ref = useRef<TextInput>(null);

  const parsePastedRegistration = (raw: string) => {
    if (!raw) return null;
    const clean = raw.trim().toUpperCase();
    const withoutInd = clean.replace(/^IND[- ]?/i, '');
    const parts = withoutInd.split(/[- ]+/).filter(Boolean);
    if (parts.length >= 4) {
      return {
        state: parts[0] || 'TN',
        port: parts[1] || '',
        type: parts[2] || '',
        serial: parts.slice(3).join(''),
      };
    }
    return null;
  };

  const handleTextChange = (
    text: string,
    setter: (val: string) => void,
    nextRef: React.RefObject<TextInput | null> | null,
    maxLen: number
  ) => {
    // If pasted full registration with delimiters or long text
    if (text.includes('-') || text.includes(' ') || text.length > maxLen + 1) {
      const parsed = parsePastedRegistration(text);
      if (parsed) {
        setStateCode(parsed.state);
        setPortCode(parsed.port);
        setTypeCode(parsed.type);
        setSerialNum(parsed.serial);
        input4Ref.current?.focus();
        return;
      }
    }

    const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setter(clean);

    if (clean.length >= maxLen && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleKeyPress = (
    e: any,
    currentVal: string,
    prevRef: React.RefObject<TextInput | null> | null
  ) => {
    if (e.nativeEvent.key === 'Backspace' && (!currentVal || currentVal.length === 0)) {
      prevRef?.current?.focus();
    }
  };

  const handleClearAll = () => {
    setStateCode('TN');
    setPortCode('');
    setTypeCode('');
    setSerialNum('');
    input2Ref.current?.focus();
  };

  const isComplete = Boolean(
    stateCode.trim() && portCode.trim() && typeCode.trim() && serialNum.trim()
  );

  const hasAnyInput = Boolean(
    (stateCode && stateCode !== 'TN') || portCode || typeCode || serialNum
  );

  const assembledReg = `IND-${stateCode.trim().toUpperCase() || '••'}-${
    portCode.trim().toUpperCase() || '•••'
  }-${typeCode.trim().toUpperCase() || '••'}-${
    serialNum.trim().toUpperCase() || '••••'
  }`;

  const handleSendOtp = async () => {
    const s1 = stateCode.trim().toUpperCase();
    const s2 = portCode.trim().toUpperCase();
    const s3 = typeCode.trim().toUpperCase();
    const s4 = serialNum.trim().toUpperCase();

    if (!s1 || !s2 || !s3 || !s4) {
      Alert.alert(
        'Incomplete Registration Number',
        'Please fill in all 4 boxes of your Boat Registration Number (State, Port/District, Type, and Serial Number).'
      );
      if (!s1) input1Ref.current?.focus();
      else if (!s2) input2Ref.current?.focus();
      else if (!s3) input3Ref.current?.focus();
      else input4Ref.current?.focus();
      return;
    }

    const trimmedRegNum = `IND-${s1}-${s2}-${s3}-${s4}`;

    setLoading(true);

    try {
      if (onSendOtp) {
        onSendOtp(trimmedRegNum);
      } else {
        const response = await sendBoatOtp(trimmedRegNum);

        if (response.success) {
          try {
            router.push({
              pathname: '/BoatOwnerOtpVerification' as any,
              params: {
                registrationNumber: trimmedRegNum,
                phoneNumber: response.boatOwner?.phoneNumber || '',
              },
            });
          } catch {
            // Navigation fallback
          }
        } else {
          Alert.alert(
            'Registration Not Found',
            response.message ||
              `Boat Registration Number ${trimmedRegNum} not found in fisheries database. Please verify and try again.`
          );
        }
      }
    } catch {
      Alert.alert(
        'Network Error',
        'Unable to connect to the Fisheries server. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch {
      router.replace('/');
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar Navigation */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleGoBack}
              activeOpacity={0.7}
              accessibilityLabel="Go back to role selection"
            >
              <MaterialIcons name="arrow-back" size={22} color="#005bb0" />
            </TouchableOpacity>

            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Boat Owner Portal</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Hero Branding Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconCircle}>
              <MaterialIcons name="directions-boat" size={38} color="#005bb0" />
            </View>
            <Text style={styles.title}>Boat Owner Login</Text>
            {/* <Text style={styles.tamilTitle}>படகு உரிமையாளர் உள்நுழைவு</Text> */}
            <Text style={styles.subtitle}>
              Enter your registered vessel number to verify ownership and manage permits
            </Text>
          </View>

          {/* Form Card Container */}
          <View style={styles.card}>
            <View style={styles.inputHeaderRow}>
              <View>
                <Text style={styles.inputLabel}>Boat Registration Number</Text>
                {/* <Text style={styles.inputTamilLabel}>படகு பதிவு எண்</Text> */}
              </View>
              {hasAnyInput && (
                <TouchableOpacity
                  onPress={handleClearAll}
                  style={styles.clearHeaderBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons name="refresh" size={14} color="#005bb0" />
                  <Text style={styles.clearHeaderText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Segmented Registration Number: Fixed IND + 4 Editable Boxes */}
            <View style={styles.segmentedContainer}>
              {/* Box 0: Fixed IND (Unchangeable) */}
              <View style={[styles.segmentColumn, styles.colInd]}>
                <View style={styles.indBox}>
                  {/* <Text style={styles.indFlag}>🇮🇳</Text> */}
                  <Text style={styles.indText}>IND</Text>
                  {/* <MaterialIcons name="lock" size={10} color="#64748b" style={styles.lockIcon} /> */}
                </View>
                <Text style={styles.boxSubLabel}>Country</Text>
              </View>

              <Text style={styles.segmentDash}>-</Text>

              {/* Box 1: State Code (TN) */}
              <View style={[styles.segmentColumn, styles.colState]}>
                <TextInput
                  ref={input1Ref}
                  style={[
                    styles.segmentInput,
                    focusedBox === 1 && styles.segmentInputFocused,
                  ]}
                  value={stateCode}
                  onChangeText={(text) => handleTextChange(text, setStateCode, input2Ref, 2)}
                  onKeyPress={(e) => handleKeyPress(e, stateCode, null)}
                  placeholder="TN"
                  placeholderTextColor="#94a3b8"
                  maxLength={3}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  editable={!loading}
                  selectionColor="#005bb0"
                  onFocus={() => setFocusedBox(1)}
                  onBlur={() => setFocusedBox(null)}
                  returnKeyType="next"
                  onSubmitEditing={() => input2Ref.current?.focus()}
                  selectTextOnFocus
                />
                <Text style={styles.boxSubLabel}>State</Text>
              </View>

              <Text style={styles.segmentDash}>-</Text>

              {/* Box 2: Port / District Code (e.g. RMD, CHE, 07) */}
              <View style={[styles.segmentColumn, styles.colPort]}>
                <TextInput
                  ref={input2Ref}
                  style={[
                    styles.segmentInput,
                    focusedBox === 2 && styles.segmentInputFocused,
                  ]}
                  value={portCode}
                  onChangeText={(text) => handleTextChange(text, setPortCode, input3Ref, 3)}
                  onKeyPress={(e) => handleKeyPress(e, portCode, input1Ref)}
                  placeholder="RMD"
                  placeholderTextColor="#94a3b8"
                  maxLength={4}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  editable={!loading}
                  selectionColor="#005bb0"
                  onFocus={() => setFocusedBox(2)}
                  onBlur={() => setFocusedBox(null)}
                  returnKeyType="next"
                  onSubmitEditing={() => input3Ref.current?.focus()}
                />
                <Text style={styles.boxSubLabel}>Port / Dist</Text>
              </View>

              <Text style={styles.segmentDash}>-</Text>

              {/* Box 3: Craft Type (e.g. MM, OB, IB) */}
              <View style={[styles.segmentColumn, styles.colType]}>
                <TextInput
                  ref={input3Ref}
                  style={[
                    styles.segmentInput,
                    focusedBox === 3 && styles.segmentInputFocused,
                  ]}
                  value={typeCode}
                  onChangeText={(text) => handleTextChange(text, setTypeCode, input4Ref, 2)}
                  onKeyPress={(e) => handleKeyPress(e, typeCode, input2Ref)}
                  placeholder="MM"
                  placeholderTextColor="#94a3b8"
                  maxLength={3}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  editable={!loading}
                  selectionColor="#005bb0"
                  onFocus={() => setFocusedBox(3)}
                  onBlur={() => setFocusedBox(null)}
                  returnKeyType="next"
                  onSubmitEditing={() => input4Ref.current?.focus()}
                />
                <Text style={styles.boxSubLabel}>Type</Text>
              </View>

              <Text style={styles.segmentDash}>-</Text>

              {/* Box 4: Serial / Number (e.g. 001, 1024) */}
              <View style={[styles.segmentColumn, styles.colSerial]}>
                <TextInput
                  ref={input4Ref}
                  style={[
                    styles.segmentInput,
                    focusedBox === 4 && styles.segmentInputFocused,
                  ]}
                  value={serialNum}
                  onChangeText={(text) => handleTextChange(text, setSerialNum, null, 7)}
                  onKeyPress={(e) => handleKeyPress(e, serialNum, input3Ref)}
                  placeholder="001"
                  placeholderTextColor="#94a3b8"
                  maxLength={7}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  editable={!loading}
                  selectionColor="#005bb0"
                  onFocus={() => setFocusedBox(4)}
                  onBlur={() => setFocusedBox(null)}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />
                <Text style={styles.boxSubLabel}>Serial No</Text>
              </View>
            </View>

            {/* Assembled Vessel Preview Badge */}
            <View style={[styles.previewCard, isComplete && styles.previewCardComplete]}>
              <View style={styles.previewLeft}>
                <MaterialCommunityIcons
                  name="sail-boat"
                  size={18}
                  color={isComplete ? '#16a34a' : '#005bb0'}
                />
                <Text style={styles.previewTitle}>Vessel Number:</Text>
              </View>
              <View style={styles.previewRight}>
                <Text
                  style={[
                    styles.previewRegText,
                    isComplete && styles.previewRegTextComplete,
                  ]}
                >
                  {assembledReg}
                </Text>
                {isComplete && (
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#16a34a"
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
            </View>

            

            {/* Format Info Chip */}
            <View style={styles.formatHintWrap}>
              <MaterialIcons name="info-outline" size={16} color="#0284c7" />
              <Text style={styles.formatHintText}>
                IND is fixed. Enter your 4 vessel segments. OTP will be delivered to the registered mobile number.
              </Text>
            </View>

            {/* Submit Action Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.btnLoadingRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.submitButtonText}>Verifying & Sending OTP...</Text>
                </View>
              ) : (
                <View style={styles.btnLoadingRow}>
                  <Text style={styles.submitButtonText}>Get OTP</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 6 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Department Security Footer */}
          <View style={styles.footerSection}>
            <View style={styles.securityBadge}>
              <MaterialIcons name="lock-outline" size={14} color="#64748b" />
              <Text style={styles.securityText}>Encrypted & Authenticated by Tamil Nadu Fisheries</Text>
            </View>
            <Text style={styles.footerHelpText}>
              Need help with your vessel registration? Contact your Port Assistant Director office.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#d0e1fd',
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  tamilTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 16,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  inputTamilLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 1,
  },
  clearHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#e8f0fe',
  },
  clearHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005bb0',
  },

  /* Segmented Boxes Row */
  segmentedContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  segmentColumn: {
    alignItems: 'center',
  },
  colInd: {
    flex: 1.15,
  },
  colState: {
    flex: 1.0,
  },
  colPort: {
    flex: 1.25,
  },
  colType: {
    flex: 1.0,
  },
  colSerial: {
    flex: 1.5,
  },
  segmentDash: {
    fontSize: 16,
    fontWeight: '800',
    color: '#94a3b8',
    marginTop: 13,
    paddingHorizontal: 1,
  },

  /* Unchangeable IND Box */
  indBox: {
    width: '100%',
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  indFlag: {
    fontSize: 12,
  },
  indText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  lockIcon: {
    marginLeft: 1,
  },

  /* 4 Editable Boxes */
  segmentInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    textAlign: 'center',
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
    paddingHorizontal: 2,
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  segmentInputFocused: {
    borderColor: '#005bb0',
    backgroundColor: '#ffffff',
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  boxSubLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },

  /* Assembled Preview Card */
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  previewCardComplete: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  previewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  previewRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewRegText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  previewRegTextComplete: {
    color: '#15803d',
  },

  /* Quick Sample Vessel Chips */
  quickSamplesWrap: {
    marginBottom: 12,
  },
  quickSamplesLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  sampleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sampleChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sampleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005bb0',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  /* Hint & Submit Button */
  formatHintWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 8,
  },
  formatHintText: {
    flex: 1,
    fontSize: 11.5,
    color: '#1e40af',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#005bb0',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 6,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
  },
  footerHelpText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 12,
  },
});
