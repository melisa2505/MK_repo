import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { RequestDetail, RequestStatus, requestService } from '../../services/request_services';
import { Tool, toolService } from '../../services/tool_services_home';

export default function RequestDetailScreen() {
  const { id, type } = useLocalSearchParams();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [yapeCode, setYapeCode] = useState('');

  // Determinar si es mi solicitud o soy el propietario
  const isMyRequest = type === 'my';
  const isOwner = request ? user?.id === request.owner_id : false;
  const isConsumer = request ? user?.id === request.consumer_id : false;

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id || !user) {
        setError('No se pudo identificar la solicitud o el usuario no ha iniciado sesión');
        setLoading(false);
        return;
      }

      try {
        // Obtener detalles de la solicitud según el tipo (mis solicitudes o solicitudes como propietario)
        const requestId = Number(id);
        const requestData = isMyRequest 
          ? await requestService.getMyRequestDetail(requestId)
          : await requestService.getOwnerRequestDetail(requestId);
        
        setRequest(requestData);
        
        // Obtener información de la herramienta
        try {
          const toolData = await toolService.getToolById(requestData.tool_id);
          setTool(toolData);
        } catch (toolError) {
          console.error('Error al cargar detalles de la herramienta:', toolError);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar detalles de la solicitud:', error);
        setError('No se pudo cargar la información de la solicitud. Intente nuevamente.');
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, user, isMyRequest]);

  // Determinar días transcurridos y restantes
  const calculateDaysInfo = () => {
    if (!request) return { elapsed: 0, remaining: 0, total: 0, status: '' };
    
    const today = new Date();
    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let elapsed = 0;
    let remaining = 0;
    let status = '';
    
    if (today < startDate) {
      // No ha comenzado aún
      remaining = totalDays;
      status = 'Comienza en ' + Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) + ' día(s)';
    } else if (today > endDate) {
      // Ya terminó
      elapsed = totalDays;
      status = 'Finalizado';
    } else {
      // En curso
      elapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      remaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      status = 'En curso';
    }
    
    return { elapsed, remaining, total: totalDays, status };
  };

  const daysInfo = request ? calculateDaysInfo() : { elapsed: 0, remaining: 0, total: 0, status: '' };

  // Función para confirmar solicitud (propietario)
  const handleConfirmRequest = async () => {
    if (!request) return;
    
    try {
      setProcessing(true);
      const updatedRequest = await requestService.confirmRequest(request.id);
      setRequest({...updatedRequest, tool_info: request.tool_info});
      Alert.alert('Éxito', 'Solicitud confirmada correctamente.');
    } catch (error) {
      console.error('Error al confirmar solicitud:', error);
      Alert.alert('Error', 'No se pudo confirmar la solicitud. Intente nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  // Función para rechazar solicitud (propietario)
  const handleRejectRequest = async () => {
    if (!request) return;
    
    Alert.alert(
      'Rechazar solicitud',
      '¿Estás seguro de que deseas rechazar esta solicitud?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const updatedRequest = await requestService.rejectRequest(request.id);
              setRequest({...updatedRequest, tool_info: request.tool_info});
              Alert.alert('Éxito', 'Solicitud rechazada correctamente.');
            } catch (error) {
              console.error('Error al rechazar solicitud:', error);
              Alert.alert('Error', 'No se pudo rechazar la solicitud. Intente nuevamente.');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  // Función para pagar solicitud (consumidor)
  const handlePayRequest = async () => {
    if (!request || !yapeCode.trim()) return;
    
    try {
      setProcessing(true);
      const updatedRequest = await requestService.payRequest(request.id, yapeCode);
      setRequest({...updatedRequest, tool_info: request.tool_info});
      setPaymentModalVisible(false);
      Alert.alert('Éxito', 'Pago registrado correctamente.');
    } catch (error) {
      console.error('Error al procesar pago:', error);
      Alert.alert('Error', 'No se pudo procesar el pago. Intente nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  // Función para confirmar recepción (consumidor)
  const handleConfirmReception = async () => {
    if (!request) return;
    
    try {
      setProcessing(true);
      const updatedRequest = await requestService.confirmReception(request.id);
      setRequest({...updatedRequest, tool_info: request.tool_info});
      Alert.alert('Éxito', 'Recepción confirmada correctamente.');
    } catch (error) {
      console.error('Error al confirmar recepción:', error);
      Alert.alert('Error', 'No se pudo confirmar la recepción. Intente nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  // Función para confirmar devolución (propietario)
  const handleConfirmReturn = async () => {
    if (!request) return;
    
    try {
      setProcessing(true);
      const updatedRequest = await requestService.confirmReturn(request.id);
      setRequest({...updatedRequest, tool_info: request.tool_info});
      Alert.alert('Éxito', 'Devolución confirmada correctamente.');
    } catch (error) {
      console.error('Error al confirmar devolución:', error);
      Alert.alert('Error', 'No se pudo confirmar la devolución. Intente nuevamente.');
    } finally {
      setProcessing(false);
    }
  };

  // Función para cancelar solicitud (consumidor)
  const handleCancelRequest = async () => {
    if (!request) return;
    
    Alert.alert(
      'Cancelar solicitud',
      '¿Estás seguro de que deseas cancelar esta solicitud?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const updatedRequest = await requestService.cancelRequest(request.id);
              setRequest({...updatedRequest, tool_info: request.tool_info});
              Alert.alert('Éxito', 'Solicitud cancelada correctamente.');
            } catch (error) {
              console.error('Error al cancelar solicitud:', error);
              Alert.alert('Error', 'No se pudo cancelar la solicitud. Intente nuevamente.');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  // Renderizar el indicador de progreso según el estado
  const renderProgressIndicator = () => {
    if (!request) return null;
    
    const stages = [
      { key: 'pending', label: 'Solicitado' },
      { key: 'confirmed', label: 'Confirmado' },
      { key: 'paid', label: 'Pagado' },
      { key: 'delivered', label: 'Entregado' },
      { key: 'returned', label: 'Devuelto' },
      { key: 'completed', label: 'Completado' }
    ];
    
    const currentStage = requestService.getStatusStage(request.status);
    
    // No mostrar la barra de progreso para solicitudes rechazadas o canceladas
    if (currentStage < 0) {
      return (
        <View style={styles.rejectedContainer}>
          <MaterialCommunityIcons 
            name={request.status === 'rejected' ? 'close-circle' : 'cancel'}
            size={36} 
            color={requestService.getStatusColor(request.status)} 
          />
          <Text style={styles.rejectedText}>
            {request.status === 'rejected' ? 'Solicitud Rechazada' : 'Solicitud Cancelada'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          {stages.slice(0, 6).map((stage, index) => {
            // Determinar si esta etapa está activa
            const isActive = currentStage >= index;
            const stageColor = isActive 
              ? requestService.getStatusColor(stage.key as RequestStatus)
              : '#D0D0D0';
            
            return (
              <React.Fragment key={stage.key}>
                {/* Círculo indicador */}
                <View style={[styles.progressCircle, { backgroundColor: stageColor }]}>
                  {isActive && (
                    <MaterialCommunityIcons 
                      name="check" 
                      size={12} 
                      color="white" 
                    />
                  )}
                </View>
                
                {/* Línea conectora (excepto en el último elemento) */}
                {index < stages.length - 1 && (
                  <View 
                    style={[
                      styles.progressLine, 
                      { backgroundColor: index < currentStage ? requestService.getStatusColor(stages[index].key as RequestStatus) : '#D0D0D0' }
                    ]} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
        
        {/* Etiquetas debajo de los indicadores */}
        <View style={styles.progressLabels}>
          {stages.map((stage, index) => (
            <Text 
              key={stage.key} 
              style={[
                styles.progressLabel,
                { 
                  color: currentStage >= index 
                    ? requestService.getStatusColor(stage.key as RequestStatus) 
                    : Colors.light.textSecondary,
                  fontWeight: currentStage === index ? 'bold' : 'normal'
                }
              ]}
            >
              {stage.label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar botones de acción según el estado y el rol
  const renderActionButtons = () => {
    if (!request || !user) return null;
    
    // Para solicitudes rechazadas o canceladas
    if (request.status === 'rejected' || request.status === 'canceled' || request.status === 'completed') {
      return null;
    }
    
    if (isConsumer) {
      // Botones para el consumidor
      if (request.status === 'pending') {
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={handleCancelRequest}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Cancelar Solicitud</Text>
            )}
          </TouchableOpacity>
        );
      } else if (request.status === 'confirmed') {
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setPaymentModalVisible(true)}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Realizar Pago</Text>
            )}
          </TouchableOpacity>
        );
      } else if (request.status === 'paid') {
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleConfirmReception}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Confirmar Recepción</Text>
            )}
          </TouchableOpacity>
        );
      }
    } else if (isOwner) {
      // Botones para el propietario
      if (request.status === 'pending') {
        return (
          <View style={styles.ownerButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectRequest}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.actionButtonText}>Rechazar</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleConfirmRequest}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.actionButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      } else if (request.status === 'returned') {
        return (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleConfirmReturn}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.actionButtonText}>Confirmar Devolución</Text>
            )}
          </TouchableOpacity>
        );
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>{error || 'No se encontró la solicitud'}</Text>
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
          title: 'Detalle de Solicitud',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {/* Cabecera con estado */}
      <View style={styles.header}>
        <View style={[styles.statusBadge, { backgroundColor: requestService.getStatusColor(request.status) }]}>
          <Text style={styles.statusText}>
            {requestService.getStatusName(request.status)}
          </Text>
        </View>
        <Text style={styles.requestId}>Solicitud #{request.id}</Text>
      </View>
      
      {/* Indicador de progreso */}
      {renderProgressIndicator()}
      
      {/* Información de la herramienta */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Herramienta</Text>
        
        <View style={styles.toolInfo}>
          {tool?.image_url ? (
            <Image 
              source={{ uri: tool.image_url }} 
              style={styles.toolImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.toolImagePlaceholder}>
              <MaterialCommunityIcons name="tools" size={24} color="#fff" />
            </View>
          )}
          
          <View style={styles.toolDetails}>
            <Text style={styles.toolName}>{tool?.name || `Herramienta #${request.tool_id}`}</Text>
            {tool && (
              <Text style={styles.toolModel}>
                {tool.brand} {tool.model}
              </Text>
            )}
            <Text style={styles.toolPrice}>S/. {request.total_amount.toFixed(2)}</Text>
          </View>
        </View>
      </View>
      
      {/* Información de la solicitud */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Detalles del Alquiler</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de inicio:</Text>
          <Text style={styles.detailValue}>
            {new Date(request.start_date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de fin:</Text>
          <Text style={styles.detailValue}>
            {new Date(request.end_date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duración:</Text>
          <Text style={styles.detailValue}>
            {daysInfo.total} día(s)
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estado:</Text>
          <Text style={styles.detailValue}>
            {daysInfo.status}
          </Text>
        </View>
        
        {request.status === 'paid' && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Código de pago:</Text>
            <Text style={styles.detailValue}>
              {request.yape_approval_code}
            </Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de solicitud:</Text>
          <Text style={styles.detailValue}>
            {new Date(request.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        
        {request.updated_at && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Última actualización:</Text>
            <Text style={styles.detailValue}>
              {new Date(request.updated_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
      </View>
      
      {/* Botones de acción */}
      {renderActionButtons()}
      
      {/* Modal para ingresar código de pago */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Realizar Pago</Text>
            
            <Text style={styles.modalInstructions}>
              Por favor, realiza el pago de S/. {request.total_amount.toFixed(2)} a través de Yape al número +51 999-999-999 y luego ingresa el código de operación.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Código de operación Yape"
              placeholderTextColor={Colors.light.textSecondary}
              value={yapeCode}
              onChangeText={setYapeCode}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmModalButton,
                  !yapeCode.trim() && styles.disabledButton
                ]}
                onPress={handlePayRequest}
                disabled={!yapeCode.trim() || processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>Confirmar Pago</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  requestId: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 10,
    textAlign: 'center',
    width: 55,
  },
  rejectedContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectedText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.light.textSecondary,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  toolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  toolImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolDetails: {
    flex: 1,
    marginLeft: 12,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  toolModel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  toolPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    flex: 2,
    fontSize: 14,
    color: Colors.light.text,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  ownerButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#777777',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInstructions: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelModalButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelModalButtonText: {
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  confirmModalButton: {
    backgroundColor: Colors.light.primary,
  },
  confirmModalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: Colors.light.textTernary,
  },
});