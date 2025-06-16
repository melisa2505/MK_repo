import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { ratingsService } from '../services/api';
import { RatingStats } from '../types/rating';
import StarRating from './StarRating';

interface RatingStatsComponentProps {
  toolId: number;
}

export default function RatingStatsComponent({ toolId }: RatingStatsComponentProps) {
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [toolId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const ratingStats = await ratingsService.getToolRatingStats(toolId);
      setStats(ratingStats);
    } catch (error) {
      console.error('Error loading rating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBarWidth = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
      </View>
    );
  }

  if (!stats || stats.total_ratings === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noRatingsText}>
          Esta herramienta aún no tiene calificaciones
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.averageContainer}>
          <Text style={styles.averageRating}>
            {stats.average_rating.toFixed(1)}
          </Text>
          <StarRating 
            rating={stats.average_rating} 
            readonly 
            size="medium"
            showValue={false}
          />
          <Text style={styles.totalRatings}>
            {stats.total_ratings} calificación{stats.total_ratings !== 1 ? 'es' : ''}
          </Text>
        </View>

        <View style={styles.distributionContainer}>
          {[5, 4, 3, 2, 1].map((starCount) => (
            <View key={starCount} style={styles.distributionRow}>
              <Text style={styles.starLabel}>{starCount}★</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      width: `${getBarWidth(stats.rating_distribution[starCount as keyof typeof stats.rating_distribution], stats.total_ratings)}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.countLabel}>
                {stats.rating_distribution[starCount as keyof typeof stats.rating_distribution]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noRatingsText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  summaryContainer: {
    flexDirection: 'row',
  },
  averageContainer: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 16,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  totalRatings: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  distributionContainer: {
    flex: 2,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  starLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    width: 20,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: Colors.light.accent,
    borderRadius: 4,
  },
  countLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    width: 20,
    textAlign: 'right',
  },
});
