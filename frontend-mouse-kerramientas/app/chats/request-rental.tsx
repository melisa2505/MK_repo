import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { chatService } from '../../services/chat_services';
import { Tool, toolService } from '../../services/tool_services_home';

export default function RequestRentalScreen() {
  const params = useLocalSearchParams();
  const chatId = Number(params.chatId);
  const toolId = Number(params.toolId);
  const ownerId = Number(params.ownerId);
  const consumerId = Number(params.consumerId);
  const dailyPrice = Number(params.dailyPrice);

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para las fechas
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [startDate, setStartDate] = useState<Date>(tomorrow);
  const [endDate, setEndDate] = useState<Date>(dayAfterTomorrow);
  const [totalCost, setTotalCost] = useState<number>(dailyPrice * 2); // Costo inicial por 2 días

  // Para controlar la visualización del selector de fecha en Android
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    const fetchToolDetails = async () => {
      if (!toolId) {
        setError('ID de herramienta no proporcionado');
        setLoading(false);
        return;
      }

      try {
        const toolData = await toolService.getToolById(toolId);
        setTool(toolData);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar detalles de la herramienta:', err);
        setError('No se pudo cargar la información. Intente nuevamente.');
        setLoading(false);
      }
    };

    fetchToolDetails();
  }, [toolId]);

  // Actualizar el costo total cuando cambian las fechas
  useEffect(() => {
    const cost = chatService.calculateRentalCost(dailyPrice, startDate.toISOString(), endDate.toISOString());
    setTotalCost(cost);
  }, [startDate, endDate, dailyPrice]);

  // Manejadores para el cambio de fecha
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      // Si la fecha de fin es anterior o igual a la fecha de inicio, ajustarla
      if (endDate <= selectedDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(selectedDate.getDate() + 1);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Asegurarse de que la fecha de fin no sea anterior a la de inicio
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert('Error', 'La fecha de fin debe ser posterior a la fecha de inicio.');
      }
    }
  };

  const handleSubmitRequest = async () => {
    if (!chatId || !toolId || !ownerId || !consumerId) {
      Alert.alert('Error', 'Falta información necesaria para procesar la solicitud.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Formatear fechas para el API (YYYY-MM-DD)
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      // Enviar la solicitud
      const response = await chatService.requestRental(
        chatId,
        toolId,
        ownerId,
        consumerId,
        formattedStartDate,
        formattedEndDate,
        totalCost
      );
      
      // Mostrar confirmación y volver al chat
      Alert.alert(
        'Solicitud enviada',
        'Tu solicitud de alquiler ha sido enviada al proveedor. Puedes revisar el estado en la sección de solicitudes.',
        [
          { 
            text: 'Volver al chat', 
            onPress: () => router.replace({
              pathname: '/chats/[id]',
              params: { id: chatId }
            })
          }
        ]
      );
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      Alert.alert('Error', 'No se pudo procesar la solicitud. Intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Formatear fechas para mostrar
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error || !tool) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error || 'No se encontró la herramienta'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Solicitud de Alquiler',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {/* Detalles de la herramienta */}
      <View style={styles.toolInfoCard}>
        <Text style={styles.toolName}>{tool.name}</Text>
        <Text style={styles.toolDetail}>
          {tool.brand} {tool.model}
        </Text>
        <Text style={styles.toolPrice}>
          S/. {dailyPrice.toFixed(2)} / día
        </Text>
      </View>
      
      {/* Selección de fechas */}
      <View style={styles.dateSelectionCard}>
        <Text style={styles.sectionTitle}>Selecciona el período de alquiler</Text>
        
        {/* Fecha de inicio */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Fecha de inicio:</Text>
          
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              minimumDate={tomorrow}
              style={styles.datePicker}
            />
          ) : (
            <>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(startDate)}
                </Text>
                <MaterialCommunityIcons name="calendar" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                  minimumDate={tomorrow}
                />
              )}
            </>
          )}
        </View>
        
        {/* Fecha de fin */}
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Fecha de fin:</Text>
          
          {Platform.OS === 'ios' ? (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={new Date(startDate.getTime() + 86400000)} // startDate + 1 día
              style={styles.datePicker}
            />
          ) : (
            <>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formatDate(endDate)}
                </Text>
                <MaterialCommunityIcons name="calendar" size={20} color={Colors.light.primary} />
              </TouchableOpacity>
              
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                  minimumDate={new Date(startDate.getTime() + 86400000)} // startDate + 1 día
                />
              )}
            </>
          )}
        </View>
      </View>
      
      {/* Resumen y costo */}
      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Resumen de la solicitud</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duración:</Text>
          <Text style={styles.summaryValue}>
            {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} día(s)
          </Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Precio diario:</Text>
          <Text style={styles.summaryValue}>S/. {dailyPrice.toFixed(2)}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>S/. {totalCost.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Botón de enviar solicitud */}
      <TouchableOpacity 
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
        onPress={handleSubmitRequest}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.disclaimer}>
        <MaterialCommunityIcons name="information-outline" size={20} color={Colors.light.textSecondary} />
        <Text style={styles.disclaimerText}>
          Al enviar esta solicitud, aceptas los términos y condiciones de alquiler.
          El propietario debe aprobar tu solicitud antes de proceder al pago.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  backButtonHeader: {
    padding: 8,
  },
  toolInfoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  toolDetail: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  toolPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  dateSelectionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  datePicker: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.light.textTernary,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
});