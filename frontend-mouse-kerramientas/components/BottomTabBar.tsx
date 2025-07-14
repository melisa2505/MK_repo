import { FontAwesome5 } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

type TabItem = {
  name: string;
  route: string;
  icon: string; // Nombre del icono de FontAwesome5
  isDynamic?: boolean; // Para indicar si es una ruta dinámica
};

export default function BottomTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs: TabItem[] = [
    { name: 'Home', route: '/', icon: 'home' },
    { name: 'Solicitudes', route: '/categories', icon: 'file-invoice' }, // Cambiamos de 'search' a 'file-invoice'
    { name: 'Chats', route: '/favorites', icon: 'comments' },
    { name: 'Notificaciones', route: '/cart', icon: 'bell' }, // Cambiamos de 'Carrito' a 'Notificaciones' y de 'shopping-cart' a 'bell'
    { name: 'Perfil', route: '/profile', icon: 'user' },
  ];

  const isTabActive = (tab: TabItem) => {
    if (tab.route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    // Para la ruta de perfil
    if (tab.route === '/profile') {
      return pathname.startsWith('/profile');
    }
    // Para la ruta de chats (que sigue siendo /favorites en el sistema de rutas)
    if (tab.route === '/favorites') {
      return pathname === '/favorites' || pathname.startsWith('/chats');
    }
    // Para la ruta de solicitudes (que sigue siendo /categories en el sistema de rutas)
    if (tab.route === '/categories') {
      return pathname === '/categories' || pathname.startsWith('/requests');
    }
    return pathname.startsWith(tab.route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = isTabActive(tab);
        
        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
          >
            <FontAwesome5 
              name={tab.icon} 
              size={22} 
              color={isActive ? Colors.light.primary : Colors.light.textSecondary} 
              style={styles.icon} 
            />
            <Text style={[
              styles.label, 
              { color: isActive ? Colors.light.primary : Colors.light.textSecondary }
            ]}>
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    height: 60,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
  },
});