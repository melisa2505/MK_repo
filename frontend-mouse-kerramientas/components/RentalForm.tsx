import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { RentalCreate } from '../types/rental';

interface RentalFormProps {
  toolId: number;
  toolName: string;
  dailyPrice: number;
  onSubmit: (rental: RentalCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const RentalForm: React.FC<RentalFormProps> = ({
  toolId,
  toolName,
  dailyPrice,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  const [notes, setNotes] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const calculateDays = (): number => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const calculateTotal = (): number => {
    return calculateDays() * dailyPrice;
  };

  const handleSubmit = async () => {
    if (endDate <= startDate) {
      Alert.alert('Error', 'La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    const rental: RentalCreate = {
      tool_id: toolId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      notes: notes.trim() || undefined,
    };

    try {
      await onSubmit(rental);
    } catch (error) {
      console.error('Error creating rental:', error);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    
    if (currentDate >= endDate) {
      setEndDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Solicitar Alquiler</Text>
        <Text style={styles.toolName}>{toolName}</Text>
        <Text style={styles.priceInfo}>Precio por día: ${dailyPrice.toFixed(2)}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.dateSection}>
          <Text style={styles.label}>Fecha de inicio</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateText}>
              {startDate.toLocaleDateString('es-ES')}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.dateSection}>
          <Text style={styles.label}>Fecha de fin</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateText}>
              {endDate.toLocaleDateString('es-ES')}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onEndDateChange}
              minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Agregar notas sobre el alquiler..."
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen del alquiler</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Días:</Text>
            <Text style={styles.summaryValue}>{calculateDays()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Precio por día:</Text>
            <Text style={styles.summaryValue}>${dailyPrice.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creando...' : 'Solicitar Alquiler'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  toolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 4,
  },
  priceInfo: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  dateText: {
    fontSize: 16,
    color: '#34495e',
  },
  inputGroup: {
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#34495e',
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
  },
  summary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  submitButton: {
    backgroundColor: '#3498db',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
