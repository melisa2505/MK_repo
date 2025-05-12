import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from './ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export function BottomTabBar() {
  const pathname = usePathname();
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const tabs = [
    { name: 'home', icon: 'home-outline', iconActive: 'home', label: 'Home' },
    { name: 'categories', icon: 'search-outline', iconActive: 'search', label: 'Categorías' },
    { name: 'shopping-bag', icon: 'cart-outline', iconActive: 'cart', label: 'Carrito' },
    { name: 'profile', icon: 'person-outline', iconActive: 'person', label: 'Perfil' },
  ];

  return (
    <ThemedView style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname.includes(tab.name);
        const color = isActive ? tintColor : iconColor;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(`/${tab.name}`)}
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name={isActive ? tab.iconActive as any : tab.icon as any}
                size={24}
                color={color}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});