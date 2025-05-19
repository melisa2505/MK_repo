import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';

type TabItem = {
  name: string;
  route: string;
  icon: string;
};

const tabs: TabItem[] = [
  { name: 'Home', route: '/', icon: '🏠' },
  { name: 'Browse', route: '/categories', icon: '🔍' },
  { name: 'Favoritos', route: '/favorites', icon: '❤️' },
  { name: 'Carrito', route: '/cart', icon: '🛒' },
  { name: 'Perfil', route: '/profile', icon: '👤' },
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
          <Text style={styles.icon}>{tab.icon}</Text>
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
    fontSize: 20,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});