import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ReturnForm } from '../../components/ReturnForm';
import { useRentals } from '../../hooks/useRentals';
import { rentalsService } from '../../services/api';
import { RentalStatus, RentalWithDetails } from '../../types/rental';

export default function RentalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { returnRental, cancelRental } = useRentals();

  const [rental, setRental] = useState<RentalWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRental(parseInt(id));
    }
  }, [id]);

  const fetchRental = async (rentalId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rentalsService.getRental(rentalId);
      setRental(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el alquiler');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    setShowReturnForm(true);
  };

  const handleCancel = () => {
    if (!rental) return;

    Alert.alert(
      'Cancelar Alquiler',
      '¿Estás seguro de que deseas cancelar este alquiler?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await cancelRental(rental.id);
              Alert.alert('Éxito', 'Alquiler cancelado correctamente');
              await fetchRental(rental.id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar el alquiler');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReturnSubmit = async (rentalId: number, returnData: any) => {
    try {
      setActionLoading(true);
      await returnRental(rentalId, returnData);
      setShowReturnForm(false);
      Alert.alert('Éxito', 'Herramienta devuelta correctamente');
      await fetchRental(rentalId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la devolución');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnCancel = () => {
    setShowReturnForm(false);
  };

  const getStatusColor = (status: RentalStatus): string => {
    switch (status) {
      case RentalStatus.PENDING:
        return '#f39c12';
      case RentalStatus.ACTIVE:
        return '#27ae60';
      case RentalStatus.RETURNED:
        return '#3498db';
      case RentalStatus.OVERDUE:
        return '#e74c3c';
      case RentalStatus.CANCELLED:
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: RentalStatus): string => {
    switch (status) {
      case RentalStatus.PENDING:
        return 'Pendiente';
      case RentalStatus.ACTIVE:
        return 'Activo';
      case RentalStatus.RETURNED:
        return 'Devuelto';
      case RentalStatus.OVERDUE:
        return 'Vencido';
      case RentalStatus.CANCELLED:
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando detalles del alquiler...</Text>
      </View>
    );
  }

  if (error || !rental) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error || 'Alquiler no encontrado'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => id && fetchRental(parseInt(id))}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showReturnForm) {
    return (
      <>
        <Stack.Screen options={{ title: 'Devolver Herramienta' }} />
        <ReturnForm
          rentalId={rental.id}
          toolName={rental.tool_name}
          onSubmit={handleReturnSubmit}
          onCancel={handleReturnCancel}
          loading={actionLoading}
        />
      </>
    );
  }

  const statusColor = getStatusColor(rental.status);
  const statusText = getStatusText(rental.status);
  const canReturn = rental.status === RentalStatus.ACTIVE;
  const canCancel = rental.status === RentalStatus.PENDING;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Detalle del Alquiler' }} />
      
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{rental.tool_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>ID del Alquiler: #{rental.id}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Herramienta</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Marca:</Text>
          <Text style={styles.value}>{rental.tool_brand}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Modelo:</Text>
          <Text style={styles.value}>{rental.tool_model}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Precio por día:</Text>
          <Text style={styles.value}>${rental.tool_daily_price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Alquiler</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Fecha de inicio:</Text>
          <Text style={styles.value}>{formatDate(rental.start_date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Fecha de fin:</Text>
          <Text style={styles.value}>{formatDate(rental.end_date)}</Text>
        </View>
        {rental.actual_return_date && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Fecha de devolución:</Text>
            <Text style={styles.value}>{formatDate(rental.actual_return_date)}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={[styles.value, styles.totalValue]}>${rental.total_price.toFixed(2)}</Text>
        </View>
      </View>

      {rental.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <Text style={styles.notesText}>{rental.notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Adicional</Text>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Creado:</Text>
          <Text style={styles.value}>{formatDate(rental.created_at)}</Text>
        </View>
        {rental.updated_at && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Actualizado:</Text>
            <Text style={styles.value}>{formatDate(rental.updated_at)}</Text>
          </View>
        )}
      </View>

      {(canReturn || canCancel) && (
        <View style={styles.actionsSection}>
          {canReturn && (
            <TouchableOpacity
              style={[styles.actionButton, styles.returnButton]}
              onPress={handleReturn}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>Devolver Herramienta</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonText}>Cancelar Alquiler</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
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
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
  notesText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
  },
  actionsSection: {
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  returnButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
