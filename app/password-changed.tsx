import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LogoKerrementas } from '@/components/LogoKerrementas';
import { CustomButton } from '@/components/CustomButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function PasswordChangedScreen() {
  const colorScheme = useColorScheme();
  const successColor = useThemeColor({}, 'success');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={[styles.successIcon, { backgroundColor: successColor }]}>
            <Ionicons name="checkmark" size={40} color="white" />
          </View>
          
          <ThemedText style={styles.title}>Password Changed!</ThemedText>
          
          <ThemedText style={styles.message}>
            Your password has successfully changed. Use your new password when logging in.
          </ThemedText>
        </View>
        
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Back to Home"
            onPress={() => router.replace('/home')}
            style={styles.button}
          />
        </View>
        
        <View style={styles.logoContainer}>
          <LogoKerrementas />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginHorizontal: 24,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    marginVertical: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
});