import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Typography } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface Step {
  title: string;
}

interface StepperProps {
  currentStep: number; // 1-indexed
  steps: Step[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isActive && styles.circleActive,
                  ]}
                >
                  {isCompleted ? (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumberText,
                        isActive && styles.stepNumberTextActive,
                      ]}
                    >
                      {stepNumber}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepTitle,
                    isActive && styles.stepTitleActive,
                    isCompleted && styles.stepTitleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {step.title}
                </Text>
              </View>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    stepNumber < currentStep && styles.lineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.md,
    marginBottom: 16,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceVariant,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primaryContainer,
    elevation: 2,
  },
  circleCompleted: {
    backgroundColor: Colors.light.secondaryTeal,
    borderColor: Colors.light.secondaryTeal,
  },
  stepNumberText: {
    ...Typography.labelSmall,
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  stepNumberTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  stepTitle: {
    ...Typography.bodySmall,
    fontSize: 10,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  stepTitleActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  stepTitleCompleted: {
    color: Colors.light.textSecondary,
  },
  line: {
    height: 2,
    flex: 0.8,
    backgroundColor: Colors.light.border,
    marginBottom: 16,
  },
  lineCompleted: {
    backgroundColor: Colors.light.secondaryTeal,
  },
});
