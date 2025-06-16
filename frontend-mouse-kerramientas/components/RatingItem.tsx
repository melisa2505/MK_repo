import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { RatingWithUser } from '../types/rating';
import StarRating from './StarRating';

interface RatingItemProps {
  rating: RatingWithUser;
}

export default function RatingItem({ rating }: RatingItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {rating.user_full_name || rating.user_username}
          </Text>
          <Text style={styles.date}>
            {formatDate(rating.created_at)}
          </Text>
        </View>
        <StarRating 
          rating={rating.rating} 
          readonly 
          size="small"
          showValue={false}
        />
      </View>
      
      {rating.comment && (
        <Text style={styles.comment}>
          {rating.comment}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  comment: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
});
