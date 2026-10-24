import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Colors, Radius, Typography, TouchTarget, Elevation } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'teal' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  const containerStyles = [
    styles.button,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    variant === 'primary' && !disabled && Elevation.level1,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? Colors.light.primary : Colors.light.textOnPrimary}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  // Sizes
  small: {
    minHeight: 36,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  medium: {
    minHeight: TouchTarget.minHeight,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  large: {
    minHeight: 54,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  // Variants
  primary: {
    backgroundColor: Colors.light.primary,
  },
  secondary: {
    backgroundColor: Colors.light.primaryContainer,
  },
  teal: {
    backgroundColor: Colors.light.secondaryTeal,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  danger: {
    backgroundColor: Colors.light.error,
  },
  disabled: {
    backgroundColor: '#C5CEE0',
    borderColor: 'transparent',
  },
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    ...Typography.labelSmall,
    fontSize: 13,
  },
  mediumText: {
    ...Typography.labelMedium,
    fontSize: 15,
  },
  largeText: {
    ...Typography.labelLarge,
    fontSize: 16,
  },
  primaryText: {
    color: Colors.light.textOnPrimary,
  },
  secondaryText: {
    color: Colors.light.primaryDark,
  },
  tealText: {
    color: Colors.light.textOnPrimary,
  },
  outlineText: {
    color: Colors.light.primary,
  },
  dangerText: {
    color: Colors.light.textOnPrimary,
  },
  disabledText: {
    color: '#8F9BB3',
  },
});
