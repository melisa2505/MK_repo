import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        headerStyle: { backgroundColor: Colors.light.background },
        headerShadowVisible: false,
      }}
      tabBar={() => null} // Ocultamos la barra de pestañas nativa y usamos nuestro BottomTabBar
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categorías',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrito',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
