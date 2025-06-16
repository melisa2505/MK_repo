import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface QuickFiltersProps {
  onFilterPress: (filter: string, value: string) => void;
}

const quickFilters = [
  { label: 'Disponibles', type: 'available', value: 'true' },
  { label: 'Nuevas', type: 'condition', value: 'new' },
  { label: 'Excelente', type: 'condition', value: 'excellent' },
  { label: 'Precio bajo', type: 'price', value: 'low' },
  { label: 'Herramientas eléctricas', type: 'category', value: 'Herramientas eléctricas' },
  { label: 'Herramientas manuales', type: 'category', value: 'Herramientas manuales' },
];

export default function QuickFilters({ onFilterPress }: QuickFiltersProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtros rápidos</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {quickFilters.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={styles.filterButton}
            onPress={() => onFilterPress(filter.type, filter.value)}
          >
            <Text style={styles.filterText}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  filterButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
