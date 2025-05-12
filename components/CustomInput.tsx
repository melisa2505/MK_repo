import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';

interface CustomInputProps extends TextInputProps {
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  label?: string;
}

export function CustomInput({ 
  secureTextEntry = false, 
  showPasswordToggle = false,
  label,
  style, 
  ...otherProps 
}: CustomInputProps) {
  const [secure, setSecure] = React.useState(secureTextEntry);
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      <View style={[styles.inputContainer, { backgroundColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }, style]}
          placeholderTextColor={iconColor}
          secureTextEntry={secure}
          {...otherProps}
        />
        {showPasswordToggle && (
          <Ionicons
            name={secure ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color={iconColor}
            onPress={() => setSecure(!secure)}
            style={styles.icon}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  icon: {
    padding: 4,
  },
});