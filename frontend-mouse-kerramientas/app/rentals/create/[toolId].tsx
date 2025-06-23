import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { RentalForm } from '../../../components/RentalForm';
import { useRentals } from '../../../hooks/useRentals';
import { Tool, toolsService } from '../../../services/api';

export default function CreateRentalScreen() {
  const { toolId } = useLocalSearchParams<{ toolId: string }>();
  const router = useRouter();
  const { createRental } = useRentals();

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (toolId) {
      fetchTool(parseInt(toolId));
    }
  }, [toolId]);

  const fetchTool = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await toolsService.getTool(id);
      setTool(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la herramienta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (rentalData: any) => {
    try {
      setCreating(true);
      await createRental(rentalData);
      Alert.alert(
        'Éxito',
        'Solicitud de alquiler creada correctamente',
        [
          {
            text: 'Ver mis alquileres',
            onPress: () => router.push('/rentals'),
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la solicitud de alquiler');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando información de la herramienta...</Text>
      </View>
    );
  }

  if (error || !tool) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error || 'Herramienta no encontrada'}</Text>
      </View>
    );
  }

  if (!tool.is_available) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'No Disponible' }} />
        <Text style={styles.errorText}>
          Esta herramienta no está disponible para alquiler en este momento.
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Solicitar Alquiler' }} />
      <RentalForm
        toolId={tool.id}
        toolName={tool.name}
        dailyPrice={tool.daily_price}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={creating}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
});
