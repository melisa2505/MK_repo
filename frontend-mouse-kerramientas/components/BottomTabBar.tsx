import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

type TabItem = {
  name: string;
  route: string;
  icon: string; // Nombre del icono de FontAwesome5
};

const tabs: TabItem[] = [
  { name: 'Home', route: '/', icon: 'home' },
  { name: 'Browse', route: '/categories', icon: 'search' },
  { name: 'Favoritos', route: '/favorites', icon: 'heart' },
  { name: 'Carrito', route: '/cart', icon: 'shopping-cart' },
  { name: 'Perfil', route: '/profile', icon: 'user' },
];

export default function BottomTabBar() {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.name}
          style={styles.tab}
          onPress={() => router.push(tab.route as '/' | '/categories' | '/favorites' | '/cart' | '/profile')}
        >
          <FontAwesome5 name={tab.icon} size={22} color={Colors.light.textSecondary} style={styles.icon} />
          <Text style={styles.label}>{tab.name}</Text>
        </Pressable>
      ))}
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
    color: Colors.light.textSecondary,
  },
});