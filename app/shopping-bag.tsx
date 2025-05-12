import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { BottomTabBar } from '@/components/BottomTabBar';
import { CustomInput } from '@/components/CustomInput';
import { CustomButton } from '@/components/CustomButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ShoppingBagScreen() {
  const colorScheme = useColorScheme();
  const iconColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');

  const cartItems = [
    {
      id: '1',
      name: 'Jan Sftanaganvik sofa',
      quantity: 1,
      price: '$599',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '2',
      name: 'Sverom chair',
      quantity: 1,
      price: '$400',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '3',
      name: 'Kailas chair',
      quantity: 1,
      price: '$199',
      image: require('@/assets/images/icon.png')
    }
  ];

  const recommendedItems = [
    {
      id: '1',
      name: 'Fiskars sofa',
      price: '$599',
      image: require('@/assets/images/icon.png')
    },
    {
      id: '2',
      name: 'Grundtal sofa',
      price: '$499',
      image: require('@/assets/images/icon.png')
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Shopping Bag</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.cartItemsContainer}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
                <View style={styles.itemDetails}>
                  <View>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <ThemedText style={styles.itemQuantity}>Qty: {item.quantity}</ThemedText>
                  </View>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity style={styles.quantityButton}>
                      <Ionicons name="remove" size={18} color={iconColor} />
                    </TouchableOpacity>
                    <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
                    <TouchableOpacity style={styles.quantityButton}>
                      <Ionicons name="add" size={18} color={iconColor} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.itemRight}>
                  <ThemedText style={styles.itemPrice}>{item.price}</ThemedText>
                  <TouchableOpacity style={styles.removeButton}>
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.couponContainer}>
            <CustomInput
              placeholder="Insert you coupon code"
              style={styles.couponInput}
            />
            <CustomButton
              title="Apply"
              onPress={() => {}}
              style={styles.applyButton}
            />
          </View>

          <View style={styles.recommendedSection}>
            <ThemedText style={styles.recommendedTitle}>Sofa you might like</ThemedText>
            <View style={styles.recommendedList}>
              {recommendedItems.map((item) => (
                <View key={item.id} style={styles.recommendedItem}>
                  <Image source={item.image} style={styles.recommendedImage} resizeMode="contain" />
                  <ThemedText style={styles.recommendedName}>{item.name}</ThemedText>
                  <ThemedText style={styles.recommendedPrice}>{item.price}</ThemedText>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={22} color={iconColor} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  cartItemsContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
  },
  itemDetails: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    height: 80,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    paddingHorizontal: 10,
    fontSize: 16,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  removeButton: {
    padding: 4,
  },
  couponContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  couponInput: {
    flex: 1,
    marginRight: 8,
    height: 48,
  },
  applyButton: {
    width: 80,
    height: 48,
    backgroundColor: '#000',
  },
  recommendedSection: {
    padding: 16,
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recommendedList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recommendedItem: {
    width: '48%',
    position: 'relative',
  },
  recommendedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F5F5F7',
  },
  recommendedName: {
    fontSize: 14,
    marginTop: 4,
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});