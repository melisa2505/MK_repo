import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../components/AppLayout';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Tool, filterToolsBySearchTerm, toolService } from '../../services/tool_services_home';

export default function HomeScreen() {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar herramientas cada vez que se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      const fetchTools = async () => {
        try {
          setLoading(true);
          setError(null);
          console.log("Cargando herramientas en el home...");
          const toolsData = await toolService.getAllTools();
          setTools(toolsData);
          setFilteredTools(toolsData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar herramientas:', error);
          setError('No se pudieron cargar las herramientas. Intente nuevamente.');
          setLoading(false);
        }
      };

      fetchTools();
    }, [])
  );

  // Función para recargar herramientas
  const reloadTools = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Recargando herramientas...");
      const toolsData = await toolService.getAllTools();
      setTools(toolsData);
      setFilteredTools(toolsData);
      setLoading(false);
    } catch (error) {
      console.error('Error al recargar herramientas:', error);
      setError('No se pudieron cargar las herramientas. Intente nuevamente.');
      setLoading(false);
    }
  };

  // Manejar búsqueda
  const handleSearch = (text: string) => {
    setSearchTerm(text);
    setFilteredTools(filterToolsBySearchTerm(tools, text));
  };

  // Navegar al detalle del producto
  const goToProductDetail = (toolId: number) => {
    router.push({
      pathname: '/product-detail',
      params: { id: toolId }
    });
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>¡Bienvenido a Mouse Kerramentas!</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar herramientas..."
            value={searchTerm}
            onChangeText={handleSearch}
          />
        </View>
        
        <Text style={styles.sectionTitle}>Herramientas Disponibles</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={reloadTools}
            >
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTools.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm ? 'No se encontraron herramientas que coincidan con su búsqueda.' : 'No hay herramientas disponibles.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTools}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => goToProductDetail(item.id)}
              >
                <View style={styles.toolImageContainer}>
                  {item.image_url ? (
                    <Image 
                      source={{ uri: item.image_url }} 
                      style={styles.toolImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.toolImagePlaceholder}>
                      <Text style={styles.toolImagePlaceholderText}>Sin imagen</Text>
                    </View>
                  )}
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolName}>{item.name}</Text>
                  <Text style={styles.toolBrand}>{item.brand} {item.model}</Text>
                  <Text style={styles.toolPrice}>S/. {item.daily_price.toFixed(2)} / día</Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
  },
  toolCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toolImage: {
    width: '100%',
    height: '100%',
  },
  toolImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolImagePlaceholderText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  toolInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text,
  },
  toolBrand: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  toolPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
