import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../components/AppLayout';
import ToolCard from '../../components/ToolCard';
import { Colors } from '../../constants/Colors';
import { toolsService } from '../../services/api';
import { Tool } from '../../types/tool';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTools, setFeaturedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFeaturedTools();
  }, []);

  const loadFeaturedTools = async () => {
    try {
      setLoading(true);
      const tools = await toolsService.getTools();
      setFeaturedTools(tools.slice(0, 6));
    } catch (error) {
      console.error('Error loading featured tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search',
        params: { q: searchQuery.trim() }
      });
    } else {
      router.push('/search');
    }
  };

  const handleToolPress = (tool: Tool) => {
    router.push({
      pathname: '/product-detail',
      params: { toolId: tool.id.toString() }
    });
  };

  const handleRentTool = (tool: Tool) => {
    router.push({
      pathname: '/rentals/create/[toolId]',
      params: { toolId: tool.id.toString() }
    });
  };

  const renderFeaturedTool = ({ item }: { item: Tool }) => (
    <ToolCard 
      tool={item} 
      onPress={handleToolPress}
      onRent={handleRentTool}
      showRentButton={true}
    />
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.welcomeText}>¡Bienvenido a Mouse Kerrementas!</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar herramientas..."
            placeholderTextColor={Colors.light.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.advancedSearchButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.advancedSearchText}>Búsqueda avanzada con filtros</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>Herramientas Destacadas</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Cargando herramientas...</Text>
          </View>
        ) : (
          <FlatList
            data={featuredTools}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFeaturedTool}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
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
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.light.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  advancedSearchButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  advancedSearchText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.light.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
});
