import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, TouchTarget } from '../../constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showGovernmentLogo?: boolean;
  rightAction?: React.ReactNode;
}

export default function Header({
  title,
  subtitle,
  onBack,
  showGovernmentLogo = false,
  rightAction,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go Back"
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        )}

        {showGovernmentLogo && (
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjJY7dzHiG81eFVKeZKUgOSRBZghVD_KOSUieN8JP56ePceAp3de3H1-MYilrJlEethAt1henHfD5vbE5xR3OE4T7FPpCZHU5GUoS5DM9Xll35CRFLXUZ5eT_E5VnQbYykbB43BtXukBWFp6V5G9bo_gSTlID_7PHykHW5VcwudNeapRyDTRX34K3oWX46urZm74O3JpKglCYVE-wwnp1St2BcslW9mnofnWErLwq16i8LHJX5r1ED',
            }}
            style={styles.emblem}
            resizeMode="contain"
          />
        )}

        {title && (
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        )}
      </View>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    minWidth: TouchTarget.minWidth,
    minHeight: TouchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: 24,
    backgroundColor: '#E8F1FC',
  },
  emblem: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.light.text,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
  },
  rightAction: {
    marginLeft: 12,
  },
});
