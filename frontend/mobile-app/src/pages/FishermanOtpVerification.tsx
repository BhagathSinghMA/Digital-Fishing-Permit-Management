import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '@/components/ui/Button';
import OtpBox from '@/components/ui/OtpBox';
import { verifyFishermanOtp, sendFishermanOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FishermanOtpProps {
  fishermanId?: string;
  phoneNumber?: string;
  onVerifySuccess?: () => void;
  onBack?: () => void;
}

export default function FishermanOtpVerification({
  fishermanId: propFishermanId,
  phoneNumber: propPhoneNumber,
  onVerifySuccess,
  onBack,
}: FishermanOtpProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ fishermanId?: string; phoneNumber?: string }>();
  const { login } = useAuth();

  const fId = propFishermanId || params.fishermanId || 'FSH123456';
  const [phone, setPhone] = useState(
    propPhoneNumber || params.phoneNumber || '+91 98765 12345'
  );

  useEffect(() => {
    if (propPhoneNumber) {
      setPhone(propPhoneNumber);
    } else if (params.phoneNumber) {
      setPhone(params.phoneNumber);
    }
  }, [propPhoneNumber, params.phoneNumber]);

  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorText, setErrorText] = useState('');

  const navigateToDashboard = () => {
    if (onVerifySuccess) {
      onVerifySuccess();
    }
    try {
      router.replace({
        pathname: '/FishermanDashboard',
        params: { fishermanId: fId },
      } as any);
    } catch {
      // Navigation fallback
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (!code || code.length < 6) {
      setErrorText('Please enter the complete 6-digit OTP code.');
      Alert.alert('Invalid OTP', 'Please enter a complete 6-digit OTP code.');
      return;
    }

    setErrorText('');
    setVerifying(true);

    try {
      const res = await verifyFishermanOtp(fId, code);
      if (res.success) {
        await login({
          role: 'fisherman',
          userId: fId,
          userData: res.fisherman,
        });
        navigateToDashboard();
      } else {
        const msg = res.message || 'Invalid OTP code. Please try again.';
        setErrorText(msg);
        Alert.alert('Verification Failed', msg);
      }
    } catch {
      setErrorText('Network error or server unreachable. Please try again.');
      Alert.alert('Network Error', 'Unable to verify OTP. Please check your connection.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setErrorText('');
    setOtpCode('');
    try {
      const res = await sendFishermanOtp(fId);
      if (res.success) {
        Alert.alert('OTP Resent', `A new OTP has been sent for ID ${fId}`);
      } else {
        Alert.alert('Error', res.message || 'Failed to resend OTP.');
      }
    } catch {
      Alert.alert('Network Error', 'Unable to connect to the Fisheries server.');
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
        router.replace('/FishermanLogin' as any);
      }
    } catch {
      router.replace('/FishermanLogin' as any);
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
              accessibilityLabel="Go back to login"
            >
              <MaterialIcons name="arrow-back" size={22} color="#005bb0" />
            </TouchableOpacity>

            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Fisherman OTP</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Hero Branding Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconCircle}>
              <MaterialCommunityIcons name="account-check-outline" size={38} color="#005bb0" />
            </View>
            <Text style={styles.title}>Fisherman Verification</Text>
            <Text style={styles.tamilTitle}>மீனவர் அடையாள சரிபார்ப்பு</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit authorization code to your mobile number registered with your Fisheries Biometric ID.
            </Text>
          </View>

          {/* Fisherman ID & Mobile Target Badge */}
          <View style={styles.targetCard}>
            <View style={styles.targetRow}>
              <MaterialIcons name="badge" size={20} color="#005bb0" />
              <Text style={styles.targetLabel}>Fisherman ID:</Text>
              <Text style={styles.targetValue}>{fId}</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetRow}>
              <MaterialCommunityIcons name="cellphone-check" size={20} color="#0284c7" />
              <Text style={styles.targetLabel}>Sent To:</Text>
              <Text style={styles.targetValue}>{phone}</Text>
            </View>
          </View>

          {/* Form Card Container */}
          <View style={styles.card}>
            <Text style={styles.codePromptLabel}>6-Digit Verification Code</Text>

            {/* 6-Digit OtpBox */}
            <OtpBox
              length={6}
              value={otpCode}
              onCodeChange={(code) => {
                setOtpCode(code);
                if (errorText) setErrorText('');
              }}
              onCodeFilled={(code: string) => {
                setOtpCode(code);
                handleVerify(code);
              }}
              onResend={handleResend}
            />

            {errorText ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            ) : null}

            {/* Demo Tip Banner */}
            <View style={styles.demoTip}>
              <MaterialIcons name="lightbulb-outline" size={16} color="#0284c7" />
              <Text style={styles.demoTipText}>Demo Test: Enter any 6 digits (e.g. 123456)</Text>
            </View>

            {/* Primary Action Button */}
            <Button
              title={verifying ? 'Verifying OTP...' : 'Verify & Continue'}
              onPress={() => handleVerify()}
              variant="primary"
              size="large"
              loading={verifying}
              disabled={otpCode.length < 6}
              style={styles.verifyButton}
            />
          </View>

          {/* Department Security Footer */}
          <View style={styles.footerSection}>
            <View style={styles.securityBadge}>
              <MaterialIcons name="lock-outline" size={14} color="#64748b" />
              <Text style={styles.securityText}>Encrypted & Authenticated by Tamil Nadu Fisheries</Text>
            </View>
            <Text style={styles.footerHelpText}>
              Didn't receive the SMS? Check your registered mobile or tap Resend Code above.
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
    marginBottom: 20,
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
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  targetValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  targetDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
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
    alignItems: 'center',
  },
  codePromptLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
    width: '100%',
  },
  errorText: {
    fontSize: 12.5,
    color: '#b91c1c',
    fontWeight: '700',
  },
  demoTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 6,
    width: '100%',
  },
  demoTipText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  verifyButton: {
    width: '100%',
    marginTop: 8,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 4,
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
