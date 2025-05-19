import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function ProductDetailScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Detalle de Producto',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>← Atrás</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView>
        {/* Imagen del producto */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Imagen del Producto</Text>
        </View>
        
        {/* Información del producto */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>Mouse Gamer RGB</Text>
          <Text style={styles.productPrice}>$49.99</Text>
          
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>★★★★☆</Text>
            <Text style={styles.reviewCount}>(42 reseñas)</Text>
          </View>
          
          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.favoriteButton}>
              <Text style={styles.favoriteButtonText}>❤️ Favorito</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addToCartButton}
              onPress={() => router.push('/cart')}
            >
              <Text style={styles.addToCartButtonText}>Agregar al Carrito</Text>
            </TouchableOpacity>
          </View>
          
          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>
              Mouse Gamer con iluminación RGB personalizable. Sensor óptico de alta precisión.
              7 botones programables. Diseño ergonómico para sesiones de juego de larga duración.
            </Text>
          </View>
          
          {/* Características */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>DPI:</Text>
              <Text style={styles.featureValue}>12,000</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Conexión:</Text>
              <Text style={styles.featureValue}>Alámbrica USB</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Botones:</Text>
              <Text style={styles.featureValue}>7 programables</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Peso:</Text>
              <Text style={styles.featureValue}>95g</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    fontSize: 16,
    color: Colors.light.primary,
    marginLeft: 10,
  },
  imagePlaceholder: {
    height: 300,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.light.accent,
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  favoriteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  favoriteButtonText: {
    fontSize: 16,
  },
  addToCartButton: {
    flex: 2,
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    width: 100,
  },
  featureValue: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
});