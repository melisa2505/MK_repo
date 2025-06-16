import { useEffect, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ratingsService } from '../services/api';
import { RatingStats } from '../types/rating';
import { Tool } from '../types/tool';
import StarRating from './StarRating';

interface ToolCardProps {
  tool: Tool;
  onPress: (tool: Tool) => void;
  onRent?: (tool: Tool) => void;
  showRentButton?: boolean;
}

export default function ToolCard({ tool, onPress, onRent, showRentButton = false }: ToolCardProps) {
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);

  useEffect(() => {
    loadRatingStats();
  }, [tool.id]);

  const loadRatingStats = async () => {
    try {
      const stats = await ratingsService.getToolRatingStats(tool.id);
      setRatingStats(stats);
    } catch (error) {
      console.error('Error loading rating stats:', error);
    }
  };

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

        {ratingStats && ratingStats.total_ratings > 0 && (
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={ratingStats.average_rating}
              readonly={true}
              size="small"
              showValue={false}
            />
            <Text style={styles.ratingText}>
              {`(${ratingStats.total_ratings})`}
            </Text>
          </View>
        )}

        {showRentButton && (
          <View style={styles.actionContainer}>
            {tool.is_available ? (
              <TouchableOpacity
                style={styles.rentButton}
                onPress={() => onRent?.(tool)}
              >
                <Text style={styles.rentButtonText}>Solicitar Alquiler</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.unavailableButton}>
                <Text style={styles.unavailableButtonText}>No Disponible</Text>
              </View>
            )}
          </View>
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starContainer: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  actionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  rentButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  rentButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  unavailableButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
