import React from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedView } from '@/components/ThemedView';
import { LogoKerrementas } from '@/components/LogoKerrementas';
import { CustomButton } from '@/components/CustomButton';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoKerrementas />
        </View>
        
        <View style={styles.buttonsContainer}>
          <CustomButton 
            title="Login" 
            onPress={() => router.push('/login')}
            style={styles.button}
            textColor='white'
          />
          <CustomButton 
            title="Register" 
            onPress={() => router.push('/register')}
            style={[styles.button, styles.registerButton]}
            textColor='black'
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    width: '100%',
  },
  button: {
    marginVertical: 8,
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
});