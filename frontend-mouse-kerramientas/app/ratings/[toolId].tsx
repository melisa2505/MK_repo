import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AppLayout from '../../components/AppLayout';
import RatingForm from '../../components/RatingForm';
import RatingItem from '../../components/RatingItem';
import RatingStatsComponent from '../../components/RatingStatsComponent';
import { Colors } from '../../constants/Colors';
import { ratingsService } from '../../services/api';
import { RatingWithUser } from '../../types/rating';

export default function ToolRatingsScreen() {
  const { toolId, toolName } = useLocalSearchParams();
  const [ratings, setRatings] = useState<RatingWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  useEffect(() => {
    if (toolId) {
      loadRatings();
    }
  }, [toolId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const toolRatings = await ratingsService.getToolRatings(Number(toolId));
      setRatings(toolRatings);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSuccess = () => {
    setShowRatingForm(false);
    loadRatings();
  };

  const renderRating = ({ item }: { item: RatingWithUser }) => (
    <RatingItem rating={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No hay calificaciones aún</Text>
      <Text style={styles.emptyStateText}>
        Sé el primero en calificar esta herramienta
      </Text>
    </View>
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <Text style={styles.title} numberOfLines={2}>
            Calificaciones - {toolName}
          </Text>
        </View>

        <RatingStatsComponent toolId={Number(toolId)} />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.addRatingButton}
            onPress={() => setShowRatingForm(true)}
          >
            <Text style={styles.addRatingButtonText}>
              Agregar Calificación
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Cargando calificaciones...</Text>
          </View>
        ) : (
          <FlatList
            data={ratings}
            renderItem={renderRating}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Modal
          visible={showRatingForm}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowRatingForm(false)}
        >
          <RatingForm
            toolId={Number(toolId)}
            onSuccess={handleRatingSuccess}
            onCancel={() => setShowRatingForm(false)}
          />
        </Modal>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  actionsContainer: {
    padding: 16,
  },
  addRatingButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addRatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
});
