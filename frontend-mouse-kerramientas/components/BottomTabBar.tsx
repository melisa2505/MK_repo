import { FontAwesome5 } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

type TabItem = {
  name: string;
  route: string;
  icon: string; // Nombre del icono de FontAwesome5
  isDynamic?: boolean; // Para indicar si es una ruta dinámica
};

// Mock del ID del usuario autenticado
const myId = "123"; // En el futuro esto vendrá de tu hook de autenticación

const tabs: TabItem[] = [
  { name: 'Home', route: '/', icon: 'home' },
  { name: 'Browse', route: '/categories', icon: 'search' },
  { name: 'Favoritos', route: '/favorites', icon: 'heart' },
  { name: 'Carrito', route: '/cart', icon: 'shopping-cart' },
  { name: 'Perfil', route: `/profile/${myId}`, icon: 'user', isDynamic: true },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isTabActive = (tab: TabItem) => {
    if (tab.route === '/') {
      return pathname === '/' || pathname === '/index';
    }
    // Para rutas dinámicas como /profile/[id], verificar si empieza con /profile/
    if (tab.isDynamic && tab.route.includes('/profile/')) {
      return pathname.startsWith('/profile/');
    }
    return pathname.startsWith(tab.route);
  };  return (
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
  },  label: {
    fontSize: 12,
  },
});