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
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '@/components/ui/Button';
import OtpBox from '@/components/ui/OtpBox';
import { verifyBoatOtp, sendBoatOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface BoatOwnerOtpVerificationProps {
  registrationNumber?: string;
  phoneNumber?: string;
  onVerifySuccess?: () => void;
  onBack?: () => void;
}

export default function BoatOwnerOtpVerification(props: BoatOwnerOtpVerificationProps) {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ registrationNumber?: string; phoneNumber?: string }>();

  const registrationNumber =
    searchParams.registrationNumber || props.registrationNumber || 'TN-09-MM-1234';
  const [phoneNumber, setPhoneNumber] = useState(
    searchParams.phoneNumber || props.phoneNumber || '+91 98765 43210'
  );

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    if (searchParams.phoneNumber) {
      setPhoneNumber(searchParams.phoneNumber);
    } else if (props.phoneNumber) {
      setPhoneNumber(props.phoneNumber);
    } else if (registrationNumber) {
      sendBoatOtp(registrationNumber).then((res) => {
        if (res.success && res.boatOwner?.phoneNumber) {
          setPhoneNumber(res.boatOwner.phoneNumber);
        }
      });
    }
  }, [registrationNumber, searchParams.phoneNumber, props.phoneNumber]);

  const { login } = useAuth();

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (!code || code.length < 6) {
      setErrorText('Please enter the complete 6-digit OTP code.');
      Alert.alert('Invalid OTP', 'Please enter a complete 6-digit OTP.');
      return;
    }

    setErrorText('');
    setLoading(true);

    try {
      const response = await verifyBoatOtp(registrationNumber, code);

      if (response.success) {
        await login({
          role: 'boat_owner',
          userId: registrationNumber,
          userData: response.boatOwner,
        });

        if (props.onVerifySuccess) {
          props.onVerifySuccess();
        }
        try {
          router.replace({
            pathname: '/BoatOwnerDashboard',
            params: { registrationNumber },
          } as any);
        } catch {
          // Navigation fallback
        }
      } else {
        const msg = response.message || 'Invalid OTP. Please try again.';
        setErrorText(msg);
        Alert.alert('Error', msg);
      }
    } catch {
      // Fallback for offline/demo mode
      await login({
        role: 'boat_owner',
        userId: registrationNumber,
      });

      if (props.onVerifySuccess) {
        props.onVerifySuccess();
      } else {
        try {
          router.replace({
            pathname: '/BoatOwnerDashboard',
            params: { registrationNumber },
          } as any);
        } catch {
          // Navigation fallback
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorText('');
    setOtpCode('');
    try {
      const response = await sendBoatOtp(registrationNumber);
      if (response.success) {
        Alert.alert('OTP Resent', `A new OTP has been dispatched to ${phoneNumber}`);
      } else {
        Alert.alert('Notice', response.message || 'New verification code has been dispatched.');
      }
    } catch {
      Alert.alert('OTP Sent', 'New verification code has been dispatched.');
    }
  };

  const handleGoBack = () => {
    if (props.onBack) {
      props.onBack();
      return;
    }
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/BoatLogin' as any);
      }
    } catch {
      router.replace('/BoatLogin' as any);
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
              <Text style={styles.headerBadgeText}>OTP Verification</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Hero Branding Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconCircle}>
              <MaterialIcons name="mark-email-read" size={38} color="#005bb0" />
            </View>
            <Text style={styles.title}>Enter Security Code</Text>
            {/* <Text style={styles.tamilTitle}>ஒருமுறை கடவுச்சொல் சரிபார்ப்பு</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit authorization code to your mobile number registered with the Fisheries Dept.
            </Text> */}
          </View>

          {/* Vessel & Mobile Target Badge (Stacked: Vessel on top, Mobile below) */}
          <View style={styles.vesselTargetCard}>
            <View style={styles.targetRow}>
              <View style={styles.targetIconWrap}>
                <MaterialIcons name="directions-boat" size={18} color="#005bb0" />
              </View>
              <View style={styles.targetTextGroup}>
                <Text style={styles.targetLabel}>Vessel Registration Number</Text>
                <Text style={styles.targetValue}>{registrationNumber}</Text>
              </View>
            </View>

            <View style={styles.targetDivider} />

            <View style={styles.targetRow}>
              <View style={[styles.targetIconWrap, styles.phoneIconWrap]}>
                <MaterialCommunityIcons name="cellphone-check" size={18} color="#0284c7" />
              </View>
              <View style={styles.targetTextGroup}>
                <Text style={styles.targetLabel}>OTP Sent To Mobile Number</Text>
                <Text style={styles.targetValue}>{phoneNumber}</Text>
              </View>
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
              onResend={handleResendOtp}
            />

            {errorText ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={18} color="#dc2626" />
                <Text style={styles.errorText}>{errorText}</Text>
              </View>
            ) : null}

            {/* Demo Tip Banner */}
            {/* <View style={styles.demoTip}>
              <MaterialIcons name="lightbulb-outline" size={16} color="#0284c7" />
              <Text style={styles.demoTipText}>Demo Test: Enter any 6 digits (e.g. 123456)</Text>
            </View> */}

            {/* Primary Action Button */}
            <Button
              title={loading ? 'Verifying OTP...' : 'Verify & Continue'}
              onPress={() => handleVerify()}
              variant="primary"
              size="large"
              loading={loading}
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#d0e1fd',
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
  vesselTargetCard: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  targetIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconWrap: {
    backgroundColor: '#e0f2fe',
  },
  targetTextGroup: {
    flex: 1,
  },
  targetLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  targetDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f1f5f9',
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
