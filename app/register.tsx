import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LogoKerrementas } from '@/components/LogoKerrementas';
import { CustomButton } from '@/components/CustomButton';
import { CustomInput } from '@/components/CustomInput';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, 'icon');

  const handleRegister = () => {
    setLoading(true);
    // Aquí iría la lógica de registro
    setTimeout(() => {
      setLoading(false);
      // Redirigir al usuario a la página home después de registrarse
      router.push('/home');
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Hello! Register to get started</ThemedText>
        </View>
        
        <View style={styles.formContainer}>
          <CustomInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <CustomInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <CustomInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showPasswordToggle
          />
          
          <CustomInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            showPasswordToggle
          />
          
          <CustomButton
            title="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />
        </View>
        
        <View style={styles.bottomContainer}>
          <ThemedText>Already have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <ThemedText style={styles.loginLink}>Login Now</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  registerButton: {
    marginTop: 8,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  loginLink: {
    color: '#FF3B30',
    fontWeight: '600',
  }
});