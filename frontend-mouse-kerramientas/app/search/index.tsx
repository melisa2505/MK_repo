import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import AppLayout from '../../components/AppLayout';
import SearchAndFilters from '../../components/SearchAndFilters';
import ToolCard from '../../components/ToolCard';
import { Colors } from '../../constants/Colors';
import { toolsService } from '../../services/api';
import { SearchFilters, Tool } from '../../types/tool';

export default function ToolSearchScreen() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async (filters: SearchFilters = {}) => {
    try {
      setLoading(true);
      let result: Tool[];
      
      if (Object.keys(filters).length === 0) {
        result = await toolsService.getTools();
      } else {
        result = await toolsService.searchTools(filters);
      }
      
      setTools(result);
      setCurrentFilters(filters);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las herramientas');
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTools(currentFilters);
    setRefreshing(false);
  };

  const handleSearch = (filters: SearchFilters) => {
    loadTools(filters);
  };

  const handleToolPress = (tool: Tool) => {
    router.push({
      pathname: '/product-detail',
      params: { toolId: tool.id.toString() }
    });
  };

  const renderTool = ({ item }: { item: Tool }) => (
    <ToolCard 
      tool={item} 
      onPress={handleToolPress}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No se encontraron herramientas</Text>
      <Text style={styles.emptyStateText}>
        Intenta modificar los filtros de búsqueda
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={Colors.light.primary} />
      <Text style={styles.loadingText}>Cargando herramientas...</Text>
    </View>
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <SearchAndFilters 
          onSearch={handleSearch}
          loading={loading}
        />
        
        {loading && tools.length === 0 ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={tools}
            renderItem={renderTool}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.light.primary]}
                tintColor={Colors.light.primary}
              />
            }
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
    backgroundColor: Colors.light.background,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
});
