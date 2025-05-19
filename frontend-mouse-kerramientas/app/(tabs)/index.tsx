import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../components/AppLayout';
import { Colors } from '../../constants/Colors';

const mockProducts = [
  { id: '1', name: 'Mouse Gamer RGB', price: '$49.99' },
  { id: '2', name: 'Teclado Mecánico', price: '$79.99' },
  { id: '3', name: 'Mousepad XL', price: '$19.99' },
];

export default function HomeScreen() {
  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>¡Bienvenido a Mouse Kerrementas!</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
          />
        </View>
        
        <Text style={styles.sectionTitle}>Productos Populares</Text>
        
        <FlatList
          data={mockProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.productCard}
              onPress={() => router.push('/product-detail')}
            >
              <View style={styles.productImagePlaceholder}>
                <Text>Imagen</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: Colors.light.text,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
});
