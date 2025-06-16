import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'medium',
  showValue = true 
}: StarRatingProps) {
  const getStarSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  const starSize = getStarSize();

  const renderStar = (index: number) => {
    const isFilled = index < Math.floor(rating);
    const isHalfFilled = index < rating && index >= Math.floor(rating);
    
    return (
      <TouchableOpacity
        key={index}
        onPress={() => !readonly && onRatingChange?.(index + 1)}
        disabled={readonly}
        style={styles.starContainer}
      >
        <Text 
          style={[
            styles.star,
            { 
              fontSize: starSize,
              color: isFilled || isHalfFilled ? Colors.light.accent : Colors.light.border
            }
          ]}
        >
          ★
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </View>
      {showValue && (
        <Text style={[styles.ratingText, { fontSize: starSize * 0.6 }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starContainer: {
    marginRight: 2,
  },
  star: {
    fontWeight: 'bold',
  },
  ratingText: {
    marginLeft: 8,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});
