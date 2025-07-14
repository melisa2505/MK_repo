import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../../components/AppLayout';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/api';

const Settings = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // Usar el servicio de logout del authService
              await authService.logout();
              // También llamar al logout del contexto para actualizar el estado
              await logout();
              // Redirigir al login
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta nuevamente.');
            }
          },
        },
      ],
    );
  };

  return (
    <AppLayout>
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Mi Cuenta</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <Ionicons name="cart-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Pedidos</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Soporte</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <View style={styles.menuItemContent}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={[styles.menuItemText, styles.dangerText]}>Cerrar Sesión</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    </View>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  dangerText: {
    color: '#ff4444',
  },
});

export default Settings;
