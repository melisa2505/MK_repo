import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BottomTabBar } from '@/components/BottomTabBar';
import { CustomInput } from '@/components/CustomInput';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function CategoriesScreen() {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, 'icon');

  const categories = [
    {
      id: '1',
      name: 'Construcción',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '2',
      name: 'Electricidad',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '3',
      name: 'Carpintería',
      image: require('@/assets/images/icon.png')
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Categorías</ThemedText>
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => router.push('/profile')}
          >
            <ThemedText style={styles.chatText}>Chat</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={iconColor} style={styles.searchIcon} />
              <CustomInput
                placeholder="Chair, desk, lamp, etc."
                style={styles.searchInput}
              />
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={styles.categoryItem}
                onPress={() => router.push('/shopping-bag')}
              >
                <Image 
                  source={category.image} 
                  style={styles.categoryImage} 
                  resizeMode="cover" 
                />
                <View style={styles.categoryOverlay}>
                  <ThemedText style={styles.categoryName}>
                    {category.name}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <BottomTabBar />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chatText: {
    color: '#FF8C00',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    padding: 0,
  },
  categoriesContainer: {
    padding: 16,
  },
  categoryItem: {
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F7',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
});