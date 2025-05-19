import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../components/AppLayout';
import { Colors } from '../../constants/Colors';

const mockCategories = [
  { id: '1', name: 'Mouses', count: 12 },
  { id: '2', name: 'Teclados', count: 15 },
  { id: '3', name: 'Mousepads', count: 8 },
  { id: '4', name: 'Headsets', count: 10 },
  { id: '5', name: 'Monitores', count: 7 },
  { id: '6', name: 'Accesorios', count: 20 },
];

export default function CategoriesScreen() {
  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Categorías</Text>
        
        <FlatList
          data={mockCategories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.categoryItem}
              onPress={() => router.push('/product-detail')}
            >
              <View style={styles.categoryIconPlaceholder}>
                <Text>🔍</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryCount}>{item.count} productos</Text>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.text,
  },
  categoryItem: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  categoryIconPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  categoryInfo: {
    marginLeft: 12,
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.text,
  },
  categoryCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
});