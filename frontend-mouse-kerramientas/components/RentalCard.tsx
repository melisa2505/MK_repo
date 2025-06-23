import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RentalStatus, RentalWithDetails } from '../types/rental';

interface RentalCardProps {
  rental: RentalWithDetails;
  onReturn?: (rental: RentalWithDetails) => void;
  onCancel?: (rental: RentalWithDetails) => void;
  onView?: (rental: RentalWithDetails) => void;
}

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
  return new Date(dateString).toLocaleDateString('es-ES');
};

export const RentalCard: React.FC<RentalCardProps> = ({
  rental,
  onReturn,
  onCancel,
  onView
}) => {
  const statusColor = getStatusColor(rental.status);
  const statusText = getStatusText(rental.status);

  const canReturn = rental.status === RentalStatus.ACTIVE;
  const canCancel = rental.status === RentalStatus.PENDING;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.toolName}>{rental.tool_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Marca:</Text> {rental.tool_brand}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Modelo:</Text> {rental.tool_model}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Precio/día:</Text> ${rental.tool_daily_price.toFixed(2)}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.label}>Total:</Text> ${rental.total_price.toFixed(2)}
        </Text>
      </View>

      <View style={styles.dates}>
        <Text style={styles.dateText}>
          <Text style={styles.label}>Inicio:</Text> {formatDate(rental.start_date)}
        </Text>
        <Text style={styles.dateText}>
          <Text style={styles.label}>Fin:</Text> {formatDate(rental.end_date)}
        </Text>
        {rental.actual_return_date && (
          <Text style={styles.dateText}>
            <Text style={styles.label}>Devuelto:</Text> {formatDate(rental.actual_return_date)}
          </Text>
        )}
      </View>

      {rental.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.label}>Notas:</Text>
          <Text style={styles.notesText}>{rental.notes}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {onView && (
          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={() => onView(rental)}
          >
            <Text style={styles.buttonText}>Ver Detalles</Text>
          </TouchableOpacity>
        )}

        {canReturn && onReturn && (
          <TouchableOpacity
            style={[styles.button, styles.returnButton]}
            onPress={() => onReturn(rental)}
          >
            <Text style={styles.buttonText}>Devolver</Text>
          </TouchableOpacity>
        )}

        {canCancel && onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => onCancel(rental)}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
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
  details: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  dates: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  notesSection: {
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: '#3498db',
  },
  returnButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
