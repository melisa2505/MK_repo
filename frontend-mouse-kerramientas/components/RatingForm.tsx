import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ratingsService } from '../services/api';
import { RatingCreate } from '../types/rating';
import StarRating from './StarRating';

interface RatingFormProps {
  toolId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RatingForm({ toolId, onSuccess, onCancel }: RatingFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Error', 'La calificación debe estar entre 1 y 5 estrellas');
      return;
    }

    try {
      setLoading(true);
      const ratingData: RatingCreate = {
        tool_id: toolId,
        rating,
        comment: comment.trim() || undefined,
      };

      await ratingsService.createRating(ratingData);
      Alert.alert('Éxito', 'Calificación enviada correctamente');
      onSuccess();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al enviar calificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calificar Herramienta</Text>
      
      <View style={styles.ratingSection}>
        <Text style={styles.label}>Tu calificación:</Text>
        <StarRating 
          rating={rating} 
          onRatingChange={setRating}
          size="large"
          showValue={true}
        />
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.label}>Comentario (opcional):</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Comparte tu experiencia con esta herramienta..."
          placeholderTextColor={Colors.light.placeholderText}
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={500}
        />
        <Text style={styles.characterCount}>
          {comment.length}/500
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Calificación</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: Colors.light.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 12,
    fontSize: 14,
    color: Colors.light.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.light.border,
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
