import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { Colors, Radius, Typography, TouchTarget } from '../../constants/theme';

interface OtpBoxProps {
  length?: number;
  value?: string;
  onCodeChange?: (code: string) => void;
  onCodeFilled?: (code: string) => void;
  onResend?: () => void;
  timerInitialSeconds?: number;
  autoFocus?: boolean;
}

export default function OtpBox({
  length = 6,
  value,
  onCodeChange,
  onCodeFilled,
  onResend,
  timerInitialSeconds = 30,
  autoFocus = false,
}: OtpBoxProps) {
  const [code, setCode] = useState<string>(value || '');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(timerInitialSeconds);
  const inputRef = useRef<TextInput>(null);

  // Sync internal state when parent prop value changes
  useEffect(() => {
    if (value !== undefined && value !== code) {
      setCode(value);
    }
  }, [value]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    setCode(cleaned);

    if (onCodeChange) {
      onCodeChange(cleaned);
    }

    if (cleaned.length === length && onCodeFilled) {
      onCodeFilled(cleaned);
    }
  };

  const handlePressBoxes = () => {
    if (inputRef.current) {
      // Force keyboard to re-show on Android/iOS even if retained in a phantom focused state
      inputRef.current.blur();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleResendClick = () => {
    if (timer === 0) {
      setTimer(timerInitialSeconds);
      setCode('');
      if (onCodeChange) onCodeChange('');

      // Explicitly blur the input so it is in a clean unfocused state
      // when native alert modals pop up and dismiss
      inputRef.current?.blur();
      setIsFocused(false);

      if (onResend) onResend();
    }
  };

  return (
    <View style={styles.container}>
      {/* Box Grid Container with direct touchable area */}
      <Pressable
        onPress={handlePressBoxes}
        style={styles.boxGridWrapper}
        accessible={true}
        accessibilityLabel="OTP input boxes"
      >
        {/* Visible OTP Styled Box Grid */}
        <View style={styles.boxesRow} pointerEvents="none">
          {Array(length)
            .fill(0)
            .map((_, index) => {
              const digit = code[index] || '';
              const isCurrentBox = isFocused && index === Math.min(code.length, length - 1);
              const isFilled = Boolean(digit);

              return (
                <View
                  key={index}
                  style={[
                    styles.box,
                    isCurrentBox && styles.boxFocused,
                    isFilled && styles.boxFilled,
                  ]}
                >
                  <Text style={styles.digitText}>{digit}</Text>
                </View>
              );
            })}
        </View>

        {/* Real native TextInput positioned directly over the entire box grid */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChangeText}
          maxLength={length}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.inputOverlay}
          caretHidden
          selectionColor="transparent"
          underlineColorAndroid="transparent"
          autoFocus={autoFocus}
        />
      </Pressable>

      {/* Countdown and Resend */}
      <View style={styles.footerRow}>
        <Text style={styles.timerText}>
          {timer > 0
            ? `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}`
            : "Didn't receive code?"}
        </Text>
        <TouchableOpacity
          disabled={timer > 0}
          onPress={handleResendClick}
          style={styles.resendButton}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.resendText,
              timer > 0 ? styles.resendDisabled : styles.resendActive,
            ]}
          >
            Resend OTP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  boxGridWrapper: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    position: 'relative',
    justifyContent: 'center',
  },
  inputOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.01,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 1,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFocused: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  boxFilled: {
    borderColor: Colors.light.secondaryTeal,
    backgroundColor: '#F4FBFB',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  timerText: {
    ...Typography.bodyMedium,
    color: Colors.light.textSecondary,
  },
  resendButton: {
    minHeight: TouchTarget.minHeight,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  resendText: {
    ...Typography.labelMedium,
  },
  resendDisabled: {
    color: Colors.light.textMuted,
  },
  resendActive: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
});
