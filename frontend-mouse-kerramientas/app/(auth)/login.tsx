import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
  const theme = Colors.light;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      {/* Header con fondo rojo */}
      <View style={styles.header}>
        <SafeAreaView style={styles.logoContainer}>
          <View style={styles.logoBg}>
            {/* Ajustamos el tamaño para que se muestre correctamente */}
            <Image 
              source={require('../../assets/images/mouske_icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.logoText}>Mouse</Text>
          <Text style={styles.logoSubText}>Kerrementas</Text>
        </SafeAreaView>
        {/* Curva inferior del header */}
        <View style={styles.curve} />
      </View>
      
      {/* Formulario */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="ejemplo@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.placeholderText}
            />
            <FontAwesome5 name="envelope" size={18} color={Colors.light.textSecondary} style={styles.inputIcon} />
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry={true}
              placeholderTextColor={theme.placeholderText}
            />
            <FontAwesome5 name="lock" size={18} color={Colors.light.textSecondary} style={styles.inputIcon} />
          </View>
        </View>
        
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '40%', // Aseguramos que el encabezado ocupe el 40% superior
    paddingTop: 20, // Añadimos padding para dispositivos con notch
  },
  curve: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    zIndex: 5, // Aseguramos que la curva esté por encima
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: -20, // Ajustamos la posición para centrar mejor
  },
  logoBg: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  logoSubText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    flex: 1,
    padding: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    backgroundColor: Colors.light.inputBg,
    padding: 16,
    fontSize: 16,
    flex: 1,
    color: Colors.light.text,
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
  },
  forgotPassword: {
    textAlign: 'right',
    color: Colors.light.forgotPasswordText,
    marginTop: 10,
    marginBottom: 30,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    color: Colors.light.textSecondary,
    fontSize: 15,
  },
  linkText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});