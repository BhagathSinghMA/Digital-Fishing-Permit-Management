import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants/theme';
import Button from './Button';

interface EmptyStateProps {
  iconName?: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export default function EmptyState({
  iconName = 'search-off',
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={iconName} size={42} color={Colors.light.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionTitle && onAction && (
        <View style={styles.buttonContainer}>
          <Button
            title={actionTitle}
            onPress={onAction}
            variant="outline"
            size="medium"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginVertical: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
