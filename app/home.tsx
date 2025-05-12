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

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, 'icon');

  const popularTools = [
    {
      id: '1',
      name: 'Taladro',
      price: 'S/ 50',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '2',
      name: 'Esmeril Angular',
      price: 'S/ 90',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '3',
      name: 'Esmeril de banco',
      price: 'S/ 80',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '4',
      name: 'Equipo de Soldar MIG',
      price: 'S/ 120',
      image: require('@/assets/images/icon.png')
    }
  ];
  
  const toolSets = [
    {
      id: '1',
      name: 'Set de Herramientas',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '2',
      name: 'Carro pinzas y desarmadores',
      image: require('@/assets/images/icon.png')
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Home</ThemedText>
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

          <View style={styles.bannerContainer}>
            <Image 
              source={require('@/assets/images/icon.png')} 
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <ThemedText style={styles.bannerTitle}>
                Herramientas para cada etapa de tu proyecto
              </ThemedText>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Popular</ThemedText>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <ThemedText style={styles.seeAll}>See all</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.popularList}
          >
            {popularTools.map((tool) => (
              <TouchableOpacity key={tool.id} style={styles.popularItem}>
                <Image source={tool.image} style={styles.popularImage} resizeMode="contain" />
                <ThemedText style={styles.popularName}>{tool.name}</ThemedText>
                <ThemedText style={styles.popularPrice}>{tool.price}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.saleContainer}>
            <ThemedText style={styles.saleTitle}>Sale</ThemedText>
            <ThemedText style={styles.saleSubtitle}>all prices up to 70% off</ThemedText>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Set de Herramientas</ThemedText>
          </View>

          <View style={styles.toolSetsContainer}>
            {toolSets.map((toolSet) => (
              <TouchableOpacity key={toolSet.id} style={styles.toolSetItem}>
                <Image source={toolSet.image} style={styles.toolSetImage} resizeMode="cover" />
                <ThemedText style={styles.toolSetName}>{toolSet.name}</ThemedText>
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
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#CCCCCC',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    color: '#FF3B30',
  },
  popularList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  popularItem: {
    width: 120,
    marginRight: 8,
  },
  popularImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
  },
  popularName: {
    marginTop: 4,
    fontSize: 14,
  },
  popularPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  saleContainer: {
    backgroundColor: '#FFE4E1',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 12,
    borderRadius: 8,
  },
  saleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  saleSubtitle: {
    fontSize: 14,
    color: '#FF3B30',
  },
  toolSetsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toolSetItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  toolSetImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 4,
  },
  toolSetName: {
    fontSize: 14,
  },
});