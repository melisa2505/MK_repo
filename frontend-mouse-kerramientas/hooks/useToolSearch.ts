import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { toolsService } from '../services/api';
import { SearchFilters, Tool } from '../types/tool';

export interface UseToolSearchResult {
  tools: Tool[];
  loading: boolean;
  searchTools: (filters: SearchFilters) => Promise<void>;
  refreshTools: () => Promise<void>;
  clearSearch: () => void;
}

export function useToolSearch(): UseToolSearchResult {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({});

  const searchTools = useCallback(async (filters: SearchFilters) => {
    try {
      setLoading(true);
      setCurrentFilters(filters);
      
      let result: Tool[];
      if (Object.keys(filters).length === 0) {
        result = await toolsService.getTools();
      } else {
        result = await toolsService.searchTools(filters);
      }
      
      setTools(result);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron buscar las herramientas');
      console.error('Error searching tools:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTools = useCallback(async () => {
    await searchTools(currentFilters);
  }, [currentFilters, searchTools]);

  const clearSearch = useCallback(() => {
    setTools([]);
    setCurrentFilters({});
  }, []);

  return {
    tools,
    loading,
    searchTools,
    refreshTools,
    clearSearch,
  };
}
