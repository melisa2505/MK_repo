import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Tool } from '../types/tool';

interface ToolCardProps {
  tool: Tool;
  onPress: (tool: Tool) => void;
}

export default function ToolCard({ tool, onPress }: ToolCardProps) {
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return '#4CAF50';
      case 'excellent':
        return '#8BC34A';
      case 'good':
        return '#FFC107';
      case 'fair':
        return '#FF9800';
      case 'poor':
        return '#F44336';
      default:
        return Colors.light.textSecondary;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return 'Nuevo';
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Bueno';
      case 'fair':
        return 'Regular';
      case 'poor':
        return 'Malo';
      default:
        return condition;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(tool)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {tool.image_url ? (
          <Image 
            source={{ uri: tool.image_url }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No imagen</Text>
          </View>
        )}
        
        {!tool.is_available && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>No disponible</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{tool.name}</Text>
        
        <View style={styles.brandContainer}>
          <Text style={styles.brand}>{tool.brand}</Text>
          {tool.model && <Text style={styles.model}> - {tool.model}</Text>}
        </View>

        <Text style={styles.category}>{tool.category}</Text>

        <View style={styles.conditionContainer}>
          <View style={[
            styles.conditionBadge, 
            { backgroundColor: getConditionColor(tool.condition) }
          ]}>
            <Text style={styles.conditionText}>
              {getConditionText(tool.condition)}
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${tool.daily_price.toFixed(2)}</Text>
          <Text style={styles.priceUnit}>/día</Text>
        </View>

        {tool.description && (
          <Text style={styles.description} numberOfLines={2}>
            {tool.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  brandContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  model: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  category: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  conditionContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});
