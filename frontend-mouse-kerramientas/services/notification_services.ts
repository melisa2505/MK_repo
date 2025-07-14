import api from './api';

// Interface para las notificaciones
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  content: string;
  read: boolean;
  timestamp: string;
}

// Modo de simulación - Cambiar a false para usar API real
export const USE_MOCK_DATA = true;

// Datos de prueba para desarrollo
export const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 2,
    type: 'request_received',
    content: 'Has recibido una solicitud de alquiler para tu Taladro Eléctrico.',
    read: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 2,
    type: 'request_confirmed',
    content: 'Tu solicitud para alquilar Sierra Circular ha sido confirmada.',
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    user_id: 2,
    type: 'payment_received',
    content: 'Has recibido un pago de S/. 50.00 por el alquiler de tu Lijadora.',
    read: true,
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 4,
    user_id: 2,
    type: 'return_reminder',
    content: 'Recuerda que debes devolver la Amoladora mañana.',
    read: true,
    timestamp: new Date(Date.now() - 172800000).toISOString()
  }
];

// Servicio para las notificaciones
export const notificationService = {
  // Obtener todas las notificaciones del usuario
  async getUserNotifications(userId: number): Promise<Notification[]> {
    // Si estamos en modo de simulación, devolvemos los datos de prueba
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulamos una pequeña demora para imitar la llamada a API
        setTimeout(() => {
          resolve(mockNotifications.filter(n => n.user_id === userId));
        }, 800);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.get<Notification[]>(`/api/notifications/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener notificaciones:', error);
      throw new Error(error.response?.data?.detail || 'Error al obtener notificaciones');
    }
  },

  // Marcar una notificación como leída
  async markNotificationAsRead(notificationId: number): Promise<void> {
    // Si estamos en modo de simulación
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Actualizamos el mock localmente
          const notification = mockNotifications.find(n => n.id === notificationId);
          if (notification) {
            notification.read = true;
          }
          resolve();
        }, 500);
      });
    }
    
    // Si no, usamos la API real
    try {
      await api.post(`/api/notifications/${notificationId}/mark-read`);
    } catch (error: any) {
      console.error('Error al marcar notificación como leída:', error);
      throw new Error(error.response?.data?.detail || 'Error al marcar notificación como leída');
    }
  }
};