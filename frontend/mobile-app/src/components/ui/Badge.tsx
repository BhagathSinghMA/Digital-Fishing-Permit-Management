import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius, Typography } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

export type StatusType = 'ACTIVE' | 'APPROVED' | 'PENDING' | 'EXPIRED' | 'REJECTED' | 'SUCCESS';

interface BadgeProps {
  label: string;
  status?: StatusType;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export default function Badge({ label, status = 'ACTIVE', iconName, style }: BadgeProps) {
  let bgColor: string = Colors.light.infoContainer;
  let textColor: string = Colors.light.info;
  let defaultIcon: keyof typeof MaterialIcons.glyphMap = 'info-outline';

  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'SUCCESS':
      bgColor = Colors.light.successContainer;
      textColor = Colors.light.success;
      defaultIcon = 'check-circle';
      break;
    case 'PENDING':
      bgColor = Colors.light.warningContainer;
      textColor = Colors.light.warning;
      defaultIcon = 'hourglass-empty';
      break;
    case 'EXPIRED':
    case 'REJECTED':
      bgColor = Colors.light.errorContainer;
      textColor = Colors.light.error;
      defaultIcon = 'error';
      break;
  }

  const icon = iconName || defaultIcon;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
      {icon && <MaterialIcons name={icon} size={14} color={textColor} style={styles.icon} />}
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...Typography.labelSmall,
    fontSize: 11,
    textTransform: 'uppercase',
  },
});
