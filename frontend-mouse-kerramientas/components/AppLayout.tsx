import { Stack } from 'expo-router';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import BottomTabBar from './BottomTabBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView 
      style={styles.container} 
      edges={['right', 'left', 'top']} // Excluimos 'bottom' para manejar manualmente el espacio inferior
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <Stack.Screen options={{ 
        headerStyle: { backgroundColor: Colors.light.background },
        headerShadowVisible: false,
      }} />
      <View style={styles.content}>
        {children}
      </View>
      <View style={styles.tabBarContainer}>
        <BottomTabBar />
        {/* Este es un espacio de seguridad para evitar que la barra de navegación se superponga con los botones del sistema */}
        <View style={styles.bottomSafeArea} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  tabBarContainer: {
    backgroundColor: Colors.light.background,
  },
  bottomSafeArea: {
    height: Platform.OS === 'android' ? 20 : 0, // Añade espacio adicional en Android
  },
});