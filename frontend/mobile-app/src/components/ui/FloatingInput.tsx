import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../constants/theme';

interface FloatingInputProps extends TextInputProps {
  label: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  helperText?: string;
}

export default function FloatingInput({
  label,
  iconName,
  error,
  helperText,
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  ...rest
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const hasValue = Boolean(value && value.length > 0);
  const showFloatingLabel = isFocused || hasValue;

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.wrapper}>
      <TouchableWithoutFeedback onPress={handleContainerPress}>
        <View
          style={[
            styles.container,
            isFocused && styles.containerFocused,
            Boolean(error) && styles.containerError,
          ]}
        >
          {iconName && (
            <MaterialIcons
              name={iconName}
              size={22}
              color={
                error
                  ? Colors.light.error
                  : isFocused
                  ? Colors.light.primary
                  : Colors.light.textMuted
              }
              style={styles.icon}
            />
          )}

          <View style={styles.inputContainer}>
            <Text
              pointerEvents="none"
              style={[
                styles.label,
                showFloatingLabel && styles.labelFloating,
                isFocused && styles.labelFocused,
                Boolean(error) && styles.labelError,
              ]}
            >
              {label}
            </Text>
            <TextInput
              ref={inputRef}
              style={[styles.input, showFloatingLabel && styles.inputWithFloatingLabel]}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={isFocused ? rest.placeholder : ''}
              placeholderTextColor={Colors.light.textMuted}
              {...rest}
            />
          </View>

          {hasValue && (
            <TouchableOpacity
              onPress={() => onChangeText && onChangeText('')}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialIcons name="cancel" size={18} color={Colors.light.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>

      {error ? (
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={14} color={Colors.light.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    height: 60,
    paddingHorizontal: 16,
  },
  containerFocused: {
    borderColor: Colors.light.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  containerError: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorContainer,
  },
  icon: {
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 0,
    top: 18,
    fontSize: 15,
    color: Colors.light.textSecondary,
    zIndex: 1,
  },
  labelFloating: {
    top: 8,
    fontSize: 11,
    fontWeight: '600',
  },
  labelFocused: {
    color: Colors.light.primary,
  },
  labelError: {
    color: Colors.light.error,
  },
  input: {
    fontSize: 16,
    color: Colors.light.text,
    padding: 0,
    margin: 0,
    height: 32,
    textAlignVertical: 'center',
  },
  inputWithFloatingLabel: {
    marginTop: 16,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.light.error,
    marginLeft: 4,
    fontWeight: '500',
  },
  helperText: {
    ...Typography.bodySmall,
    color: Colors.light.textSecondary,
    marginTop: 6,
    marginLeft: 4,
  },
});
