import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../components/AppLayout';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Notification, notificationService } from '../../services/notification_services';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // Función para cargar las notificaciones
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Siempre llamamos al servicio, que internamente decidirá si usar mocks o API real
      const data = await notificationService.getUserNotifications(user.id);
      
      // Ordenamos las notificaciones: primero no leídas, luego por fecha
      const sortedNotifications = [...data].sort((a, b) => {
        // Primero por estado de lectura (no leídas primero)
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        // Luego por timestamp (más recientes primero)
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      setNotifications(sortedNotifications);
    } catch (err: any) {
      console.error('Error al cargar notificaciones:', err);
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Cargar notificaciones cuando se monta el componente o cambia el usuario
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Recargar cuando la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  // Función para marcar una notificación como leída
  const handleMarkAsRead = async (notificationId: number) => {
    // Evitar procesamiento duplicado
    if (processingIds.includes(notificationId)) return;
    
    // Actualizar estado para mostrar que está procesando
    setProcessingIds(prev => [...prev, notificationId]);
    
    try {
      // Siempre llamamos al servicio, que internamente decidirá si usar mocks o API real
      await notificationService.markNotificationAsRead(notificationId);
      
      // Actualizamos el estado local después de la llamada al servicio
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err: any) {
      console.error('Error al marcar notificación como leída:', err);
    } finally {
      // Quitar el ID del estado de procesamiento
      setProcessingIds(prev => prev.filter(id => id !== notificationId));
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('es-ES', options);
  };

  // Renderizar cada notificación
  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[
      styles.notificationItem, 
      !item.read && styles.notificationUnread
    ]}>
      <View style={styles.notificationContent}>
        {/* Icono según el tipo de notificación */}
        <View style={[
          styles.notificationIcon,
          getNotificationTypeStyle(item.type)
        ]}>
          <FontAwesome5 
            name={getNotificationTypeIcon(item.type)} 
            size={18} 
            color="white" 
          />
        </View>
        
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationText}>{item.content}</Text>
          <Text style={styles.notificationDate}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
      </View>
      
      {!item.read && (
        <TouchableOpacity 
          style={styles.markReadButton}
          onPress={() => handleMarkAsRead(item.id)}
          disabled={processingIds.includes(item.id)}
        >
          {processingIds.includes(item.id) ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <FontAwesome5 name="check" size={14} color={Colors.light.primary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  // Obtener el icono según el tipo de notificación
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'request_received':
        return 'hand-holding';
      case 'request_confirmed':
        return 'check-circle';
      case 'payment_received':
        return 'money-bill-wave';
      case 'return_reminder':
        return 'clock';
      default:
        return 'bell';
    }
  };

  // Obtener el estilo según el tipo de notificación
  const getNotificationTypeStyle = (type: string) => {
    switch (type) {
      case 'request_received':
        return styles.iconRequest;
      case 'request_confirmed':
        return styles.iconConfirmed;
      case 'payment_received':
        return styles.iconPayment;
      case 'return_reminder':
        return styles.iconReminder;
      default:
        return {};
    }
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Notificaciones</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Cargando notificaciones...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-circle" size={40} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="bell-slash" size={50} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>No tienes notificaciones</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNotification}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={loadNotifications}
          />
        )}
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.text,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationUnread: {
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: Colors.light.primary,
  },
  iconRequest: {
    backgroundColor: '#E53935', // Rojo
  },
  iconConfirmed: {
    backgroundColor: '#43A047', // Verde
  },
  iconPayment: {
    backgroundColor: '#1E88E5', // Azul
  },
  iconReminder: {
    backgroundColor: '#FB8C00', // Naranja
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  markReadButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginVertical: 10,
    color: Colors.light.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});