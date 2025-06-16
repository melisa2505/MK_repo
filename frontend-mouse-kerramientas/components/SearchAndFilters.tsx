import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { toolsService } from '../services/api';
import { FilterOptions, SearchFilters, ToolCondition } from '../types/tool';

interface SearchAndFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

export default function SearchAndFilters({ onSearch, loading }: SearchAndFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const options = await toolsService.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las opciones de filtro');
    }
  };

  const handleSearch = () => {
    const searchFilters: SearchFilters = {
      ...filters,
      q: searchQuery.trim() || undefined,
    };
    onSearch(searchFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
    onSearch({});
  };

  const applyFilters = () => {
    setShowFilters(false);
    handleSearch();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.condition) count++;
    if (filters.min_price !== undefined) count++;
    if (filters.max_price !== undefined) count++;
    if (filters.available !== undefined) count++;
    return count;
  };

  return (
    <View style={styles.container}>
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
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            getActiveFiltersCount() > 0 && styles.filterButtonActive
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={[
            styles.filterButtonText,
            getActiveFiltersCount() > 0 && styles.filterButtonTextActive
          ]}>
            Filtros {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Text>
        </TouchableOpacity>

        {getActiveFiltersCount() > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={applyFilters}>
              <Text style={styles.modalApplyText}>Aplicar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Categoría</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.category || ''}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      category: value === '' ? undefined : value 
                    }))
                  }
                >
                  <Picker.Item label="Todas las categorías" value="" />
                  {filterOptions?.categories.map((category) => (
                    <Picker.Item 
                      key={category} 
                      label={category} 
                      value={category} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Marca</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.brand || ''}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      brand: value === '' ? undefined : value 
                    }))
                  }
                >
                  <Picker.Item label="Todas las marcas" value="" />
                  {filterOptions?.brands.map((brand) => (
                    <Picker.Item 
                      key={brand} 
                      label={brand} 
                      value={brand} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Condición</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={filters.condition || ''}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      condition: value === '' ? undefined : value as ToolCondition 
                    }))
                  }
                >
                  <Picker.Item label="Todas las condiciones" value="" />
                  {Object.values(ToolCondition).map((condition) => (
                    <Picker.Item 
                      key={condition} 
                      label={condition.charAt(0).toUpperCase() + condition.slice(1)} 
                      value={condition} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Precio mínimo</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor={Colors.light.placeholderText}
                value={filters.min_price?.toString() || ''}
                onChangeText={(text) => {
                  const value = parseFloat(text);
                  setFilters(prev => ({ 
                    ...prev, 
                    min_price: isNaN(value) ? undefined : value 
                  }));
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Precio máximo</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="999.99"
                placeholderTextColor={Colors.light.placeholderText}
                value={filters.max_price?.toString() || ''}
                onChangeText={(text) => {
                  const value = parseFloat(text);
                  setFilters(prev => ({ 
                    ...prev, 
                    max_price: isNaN(value) ? undefined : value 
                  }));
                }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Disponibilidad</Text>
              <View style={styles.availabilityContainer}>
                <TouchableOpacity
                  style={[
                    styles.availabilityButton,
                    filters.available === undefined && styles.availabilityButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, available: undefined }))}
                >
                  <Text style={[
                    styles.availabilityButtonText,
                    filters.available === undefined && styles.availabilityButtonTextActive
                  ]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.availabilityButton,
                    filters.available === true && styles.availabilityButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, available: true }))}
                >
                  <Text style={[
                    styles.availabilityButtonText,
                    filters.available === true && styles.availabilityButtonTextActive
                  ]}>
                    Disponibles
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.availabilityButton,
                    filters.available === false && styles.availabilityButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, available: false }))}
                >
                  <Text style={[
                    styles.availabilityButtonText,
                    filters.available === false && styles.availabilityButtonTextActive
                  ]}>
                    No disponibles
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: Colors.light.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalCancelText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalApplyText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: Colors.light.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  priceInput: {
    backgroundColor: Colors.light.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  availabilityButton: {
    flex: 1,
    backgroundColor: Colors.light.border,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  availabilityButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  availabilityButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  availabilityButtonTextActive: {
    color: 'white',
  },
});
