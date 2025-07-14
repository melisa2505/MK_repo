import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppLayout from '../components/AppLayout';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { ToolCreate, toolsService } from '../services/api';

export default function CreatePost() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ToolCreate>({
    name: '',
    description: '',
    brand: '',
    model: '',
    daily_price: 0,
    warranty: 0,
    condition: 'good',
    category_id: 1,
    image_url: '',
  });

  const handleInputChange = (field: keyof ToolCreate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    if (!formData.brand.trim()) {
      Alert.alert('Error', 'La marca es requerida');
      return false;
    }
    if (!formData.model.trim()) {
      Alert.alert('Error', 'El modelo es requerido');
      return false;
    }
    if (formData.daily_price <= 0) {
      Alert.alert('Error', 'El precio diario debe ser mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await toolsService.createTool(formData);
      
      Alert.alert(
        'Éxito',
        'Herramienta creada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear la herramienta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Herramienta</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Taladro Inalámbrico"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe tu herramienta..."
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Marca *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: DeWalt"
                value={formData.brand}
                onChangeText={(text) => handleInputChange('brand', text)}
                maxLength={50}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Modelo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: DCD777C2"
                value={formData.model}
                onChangeText={(text) => handleInputChange('model', text)}
                maxLength={50}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Precio/día (S/.) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.daily_price.toString()}
                onChangeText={(text) => handleInputChange('daily_price', parseFloat(text) || 0)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Garantía (S/.)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={formData.warranty?.toString() || ''}
                onChangeText={(text) => handleInputChange('warranty', parseFloat(text) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condición</Text>
            <View style={styles.conditionContainer}>
              {[
                { value: 'new', label: 'Nuevo' },
                { value: 'excellent', label: 'Excelente' },
                { value: 'good', label: 'Bueno' },
                { value: 'fair', label: 'Regular' },
                { value: 'poor', label: 'Malo' }
              ].map((condition) => (
                <TouchableOpacity
                  key={condition.value}
                  style={[
                    styles.conditionButton,
                    formData.condition === condition.value && styles.conditionButtonActive
                  ]}
                  onPress={() => handleInputChange('condition', condition.value)}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    formData.condition === condition.value && styles.conditionButtonTextActive
                  ]}>
                    {condition.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL de imagen</Text>
            <TextInput
              style={styles.input}
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.image_url}
              onChangeText={(text) => handleInputChange('image_url', text)}
              keyboardType="url"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando...' : 'Crear Herramienta'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
    marginBottom: 8,
  },
  conditionButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  conditionButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '500',
  },
  conditionButtonTextActive: {
    color: 'white',
  },
});
