import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Tool, ToolOwner, toolService } from '../../services/tool_services_home';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [owner, setOwner] = useState<ToolOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToolDetails = async () => {
      if (!id) {
        setError('ID de herramienta no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Obtener detalles de la herramienta
        const toolData = await toolService.getToolById(Number(id));
        setTool(toolData);
        
        // Obtener información del propietario
        const ownerData = await toolService.getToolOwner(toolData.owner_id);
        setOwner(ownerData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar detalles de la herramienta:', error);
        setError('No se pudo cargar la información. Intente nuevamente.');
        setLoading(false);
      }
    };

    fetchToolDetails();
  }, [id]);

  const handleContactOwner = async () => {
    if (!tool || !user) return;
    
    try {
      // Crear un chat con el propietario
      const chatResponse = await toolService.createChat(
        tool.owner_id,
        user.id,
        tool.id
      );
      
      // Mostrar confirmación
      Alert.alert(
        "Chat creado",
        "Se ha creado un chat con el proveedor. Pronto podrás acceder a él desde la sección de chats.",
        [{ text: "OK" }]
      );
      
      // Aquí podrías redirigir a la pantalla de chat si ya estuviera implementada
      // router.push('/chats');
      
    } catch (error) {
      console.error('Error al crear chat:', error);
      Alert.alert(
        "Error",
        "No se pudo crear el chat con el proveedor. Intente nuevamente.",
        [{ text: "OK" }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error || !tool) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error || 'No se encontró la herramienta'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: tool.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen del producto */}
        <View style={styles.imageContainer}>
          {tool.image_url ? (
            <Image 
              source={{ uri: tool.image_url }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="tools" size={80} color={Colors.light.textSecondary} />
              <Text style={styles.imagePlaceholderText}>Sin imagen</Text>
            </View>
          )}
        </View>
        
        {/* Información del producto */}
        <View style={styles.infoContainer}>
          {/* Detalles principales */}
          <View style={styles.mainInfoContainer}>
            <View>
              <Text style={styles.productName}>{tool.name}</Text>
              <Text style={styles.productBrand}>
                {tool.brand} {tool.model}
              </Text>
            </View>
            <Text style={styles.productPrice}>S/. {tool.daily_price.toFixed(2)} / día</Text>
          </View>
          
          {/* Estado de disponibilidad */}
          <View style={[
            styles.availabilityBadge,
            tool.is_available ? styles.availableBadge : styles.unavailableBadge
          ]}>
            <Text style={styles.availabilityText}>
              {tool.is_available ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
          
          {/* Información del propietario */}
          {owner && (
            <View style={styles.ownerContainer}>
              <Text style={styles.sectionTitle}>Información del Proveedor</Text>
              <View style={styles.ownerInfoCard}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerInitials}>
                    {owner.full_name ? owner.full_name.charAt(0).toUpperCase() : owner.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>{owner.full_name || owner.username}</Text>
                  <Text style={styles.ownerContact}>{owner.email}</Text>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handleContactOwner}
                  >
                    <MaterialCommunityIcons name="chat" size={18} color="#FFFFFF" />
                    <Text style={styles.contactButtonText}>Contactar Proveedor</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          
          {/* Descripción */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{tool.description}</Text>
          </View>
          
          {/* Características */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Estado:</Text>
                <Text style={styles.featureValue}>{tool.condition}</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Garantía:</Text>
                <Text style={styles.featureValue}>{tool.warranty} días</Text>
              </View>
            </View>
            
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Marca:</Text>
                <Text style={styles.featureValue}>{tool.brand}</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureLabel}>Modelo:</Text>
                <Text style={styles.featureValue}>{tool.model}</Text>
              </View>
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
  backButtonHeader: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.light.secondary,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
  infoContainer: {
    padding: 20,
  },
  mainInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  availableBadge: {
    backgroundColor: '#e6f7ed',
  },
  unavailableBadge: {
    backgroundColor: '#ffebee',
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00695c',
  },
  ownerContainer: {
    marginBottom: 24,
  },
  ownerInfoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ownerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ownerInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  ownerContact: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
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
  featureRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureItem: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  featureValue: {
    fontSize: 16,
    color: Colors.light.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});