import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendFishermanOtp } from '../services/api';

interface FishermanLoginProps {
  onSendOtp?: (fishermanId: string, phoneNumber?: string) => void;
  onBack?: () => void;
}

export default function FishermanLogin({ onSendOtp, onBack }: FishermanLoginProps) {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [fishermanId, setFishermanId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSendOtp = async () => {
    const trimmedId = fishermanId.trim().toUpperCase();

    if (!trimmedId) {
      Alert.alert('Validation Error', 'Please enter your Fisherman ID.');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await sendFishermanOtp(trimmedId);

      if (!response.success) {
        Alert.alert(
          'Invalid Fisherman ID',
          response.message || 'Fisherman ID not found in the fisheries database. Please verify your ID and try again.'
        );
        return;
      }

      if (onSendOtp) {
        onSendOtp(trimmedId, response.fisherman?.phoneNumber);
      } else {
        try {
          router.push({
            pathname: '/FishermanOtpVerification' as any,
            params: {
              fishermanId: trimmedId,
              phoneNumber: response.fisherman?.phoneNumber || '',
            },
          });
        } catch {
          // Navigation fallback
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
              <Text style={styles.headerBadgeText}>Fisherman Portal</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Hero Branding Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconCircle}>
              <MaterialCommunityIcons name="account-tie-hat" size={38} color="#005bb0" />
            </View>
            <Text style={styles.title}>Fisherman Login</Text>
            <Text style={styles.tamilTitle}>மீனவர் உறுப்பினர் உள்நுழைவு</Text>
            <Text style={styles.subtitle}>
              Enter your official Biometric ID to view assigned boat permits and valid harbor tokens
            </Text>
          </View>

          {/* Form Card Container */}
          <View style={styles.card}>
            <View style={styles.inputHeaderRow}>
              <Text style={styles.inputLabel}>Fisherman Biometric ID</Text>
              <Text style={styles.inputTamilLabel}>மீனவர் அடையாள எண்</Text>
            </View>

            {/* Tap-Friendly Material 3 Input Field */}
            <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
              <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
                <View style={styles.inputIconWrap}>
                  <MaterialIcons
                    name="badge"
                    size={22}
                    color={isFocused ? '#005bb0' : '#64748b'}
                  />
                </View>

                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder="e.g. FSH123456"
                  placeholderTextColor="#94a3b8"
                  value={fishermanId}
                  onChangeText={(text) => setFishermanId(text.toUpperCase())}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  editable={!loading}
                  selectionColor="#005bb0"
                  underlineColorAndroid="transparent"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />

                {fishermanId.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearBtn}
                    onPress={() => {
                      setFishermanId('');
                      inputRef.current?.focus();
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <MaterialIcons name="cancel" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>

            {/* Format Info Chip */}
            <View style={styles.formatHintWrap}>
              <MaterialIcons name="info-outline" size={16} color="#0284c7" />
              <Text style={styles.formatHintText}>
                OTP will be delivered to the mobile number registered with your Fisheries ID.
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
              Need assistance with your Fisherman Biometric ID? Contact your local Fisheries Inspector.
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
    paddingHorizontal: 20,
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
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005bb0',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  tamilTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 20,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputContainerFocused: {
    borderColor: '#005bb0',
    backgroundColor: '#ffffff',
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIconWrap: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.5,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  clearBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formatHintWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 8,
  },
  formatHintText: {
    flex: 1,
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 17,
  },
  submitButton: {
    backgroundColor: '#005bb0',
    borderRadius: 16,
    height: 52,
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
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  footerHelpText: {
    fontSize: 10.5,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
});
