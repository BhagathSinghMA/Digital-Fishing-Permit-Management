import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { Colors, Radius, Elevation } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  accentColor?: string;
  activeOpacity?: number;
}

export default function Card({
  children,
  style,
  onPress,
  variant = 'elevated',
  accentColor,
  activeOpacity = 0.8,
}: CardProps) {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'filled' && styles.filled,
    accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : null,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: 20,
    marginVertical: 6,
    width: '100%',
  },
  elevated: {
    ...Elevation.level2,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filled: {
    backgroundColor: Colors.light.surfaceVariant,
  },
});
