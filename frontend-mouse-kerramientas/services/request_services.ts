import api from './api';

// Interfaces para las solicitudes
export interface Request {
  id: number;
  tool_id: number;
  owner_id: number;
  consumer_id: number;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: RequestStatus;
  yape_approval_code: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface RequestDetail extends Request {
  tool_info?: any; // Información adicional de la herramienta si está disponible
}

// Estados posibles de una solicitud
export type RequestStatus = 
  | 'pending'    // Solicitud creada, esperando confirmación del propietario
  | 'confirmed'  // Confirmada por el propietario, pendiente de pago
  | 'paid'       // Pagada por el consumidor, pendiente de entrega
  | 'delivered'  // Herramienta entregada al consumidor
  | 'returned'   // Herramienta devuelta al propietario
  | 'completed'  // Proceso completado
  | 'rejected'   // Rechazada por el propietario
  | 'canceled';  // Cancelada por el consumidor

// Modo de simulación - Cambiar a false para usar API real
const USE_MOCK_DATA = true;

// Datos de prueba para solicitudes
const MOCK_REQUESTS: Request[] = [
  {
    id: 1,
    tool_id: 1,
    owner_id: 2,
    consumer_id: 1,
    start_date: '2025-07-15',
    end_date: '2025-07-20',
    total_amount: 250.00,
    status: 'pending',
    yape_approval_code: null,
    created_at: '2025-07-10T15:30:22Z',
    updated_at: null
  },
  {
    id: 2,
    tool_id: 3,
    owner_id: 4,
    consumer_id: 1,
    start_date: '2025-07-20',
    end_date: '2025-07-25',
    total_amount: 150.00,
    status: 'confirmed',
    yape_approval_code: null,
    created_at: '2025-07-08T10:15:30Z',
    updated_at: '2025-07-09T08:30:10Z'
  },
  {
    id: 3,
    tool_id: 5,
    owner_id: 3,
    consumer_id: 1,
    start_date: '2025-07-05',
    end_date: '2025-07-10',
    total_amount: 200.00,
    status: 'paid',
    yape_approval_code: 'YP-123456',
    created_at: '2025-07-01T09:45:00Z',
    updated_at: '2025-07-02T14:20:15Z'
  },
  {
    id: 4,
    tool_id: 8,
    owner_id: 5,
    consumer_id: 1,
    start_date: '2025-06-25',
    end_date: '2025-07-05',
    total_amount: 450.00,
    status: 'delivered',
    yape_approval_code: 'YP-789012',
    created_at: '2025-06-20T16:30:00Z',
    updated_at: '2025-06-25T10:00:00Z'
  },
  {
    id: 5,
    tool_id: 10,
    owner_id: 1,
    consumer_id: 3,
    start_date: '2025-07-15',
    end_date: '2025-07-18',
    total_amount: 180.00,
    status: 'pending',
    yape_approval_code: null,
    created_at: '2025-07-12T11:20:00Z',
    updated_at: null
  },
  {
    id: 6,
    tool_id: 12,
    owner_id: 1,
    consumer_id: 4,
    start_date: '2025-07-20',
    end_date: '2025-07-23',
    total_amount: 210.00,
    status: 'confirmed',
    yape_approval_code: null,
    created_at: '2025-07-15T09:30:00Z',
    updated_at: '2025-07-16T14:15:00Z'
  },
  {
    id: 7,
    tool_id: 15,
    owner_id: 1,
    consumer_id: 2,
    start_date: '2025-07-01',
    end_date: '2025-07-10',
    total_amount: 350.00,
    status: 'delivered',
    yape_approval_code: 'YP-567890',
    created_at: '2025-06-28T15:40:00Z',
    updated_at: '2025-07-01T10:30:00Z'
  },
  {
    id: 8,
    tool_id: 18,
    owner_id: 1,
    consumer_id: 5,
    start_date: '2025-06-20',
    end_date: '2025-06-25',
    total_amount: 200.00,
    status: 'returned',
    yape_approval_code: 'YP-345678',
    created_at: '2025-06-15T13:20:00Z',
    updated_at: '2025-06-25T18:10:00Z'
  },
  {
    id: 9,
    tool_id: 20,
    owner_id: 3,
    consumer_id: 1,
    start_date: '2025-07-25',
    end_date: '2025-07-30',
    total_amount: 280.00,
    status: 'rejected',
    yape_approval_code: null,
    created_at: '2025-07-20T10:15:00Z',
    updated_at: '2025-07-21T09:30:00Z'
  }
];

// Servicios para solicitudes
export const requestService = {
  // Obtener solicitudes de un consumidor
  async getMyRequests(userId: number): Promise<Request[]> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => {
          const myRequests = MOCK_REQUESTS.filter(req => req.consumer_id === userId);
          resolve(myRequests);
        }, 800);
      });
    }
    
    try {
      const response = await api.get<Request[]>(`/api/requests/mis-solicitudes/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener solicitudes');
    }
  },

  // Obtener solicitudes de un propietario
  async getOwnerRequests(userId: number): Promise<Request[]> {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => {
          const ownerRequests = MOCK_REQUESTS.filter(req => req.owner_id === userId);
          resolve(ownerRequests);
        }, 800);
      });
    }
    
    try {
      const response = await api.get<Request[]>(`/api/requests/sus-solicitudes/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener solicitudes');
    }
  },

  // Obtener detalles de una solicitud como consumidor
  async getMyRequestDetail(requestId: number): Promise<RequestDetail> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const request = MOCK_REQUESTS.find(req => req.id === requestId);
          if (request) {
            resolve({
              ...request,
              tool_info: {
                name: 'Taladro Inalámbrico',
                brand: 'DeWalt',
                model: 'DCD777C2',
                image_url: 'https://example.com/tools/drill.jpg'
              }
            });
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.get<RequestDetail>(`/api/requests/mis-solicitudes/${requestId}/detail`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener detalles de la solicitud');
    }
  },

  // Obtener detalles de una solicitud como propietario
  async getOwnerRequestDetail(requestId: number): Promise<RequestDetail> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const request = MOCK_REQUESTS.find(req => req.id === requestId);
          if (request) {
            resolve({
              ...request,
              tool_info: {
                name: 'Taladro Inalámbrico',
                brand: 'DeWalt',
                model: 'DCD777C2',
                image_url: 'https://example.com/tools/drill.jpg'
              }
            });
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.get<RequestDetail>(`/api/requests/sus-solicitudes/${requestId}/detail`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener detalles de la solicitud');
    }
  },

  // Cancelar una solicitud (como consumidor)
  async cancelRequest(requestId: number): Promise<Request> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const requestIndex = MOCK_REQUESTS.findIndex(req => req.id === requestId);
          if (requestIndex >= 0) {
            const updatedRequest = {
              ...MOCK_REQUESTS[requestIndex],
              status: 'canceled' as RequestStatus,
              updated_at: new Date().toISOString()
            };
            MOCK_REQUESTS[requestIndex] = updatedRequest;
            resolve(updatedRequest);
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.post<Request>(`/api/requests/mis-solicitudes/${requestId}/cancelar`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al cancelar solicitud');
    }
  },

  // Pagar una solicitud (como consumidor)
  async payRequest(requestId: number, yapeCode: string): Promise<Request> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const requestIndex = MOCK_REQUESTS.findIndex(req => req.id === requestId);
          if (requestIndex >= 0) {
            const updatedRequest = {
              ...MOCK_REQUESTS[requestIndex],
              status: 'paid' as RequestStatus,
              yape_approval_code: yapeCode,
              updated_at: new Date().toISOString()
            };
            MOCK_REQUESTS[requestIndex] = updatedRequest;
            resolve(updatedRequest);
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.post<Request>(`/api/requests/mis-solicitudes/${requestId}/pagar`, null, {
        params: { yape_code: yapeCode }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al procesar el pago');
    }
  },

  // Confirmar recepción de herramienta (como consumidor)
  async confirmReception(requestId: number): Promise<Request> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const requestIndex = MOCK_REQUESTS.findIndex(req => req.id === requestId);
          if (requestIndex >= 0) {
            const updatedRequest = {
              ...MOCK_REQUESTS[requestIndex],
              status: 'delivered' as RequestStatus,
              updated_at: new Date().toISOString()
            };
            MOCK_REQUESTS[requestIndex] = updatedRequest;
            resolve(updatedRequest);
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.post<Request>(`/api/requests/mis-solicitudes/${requestId}/confirmar-recepcion`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al confirmar recepción');
    }
  },

  // Confirmar solicitud (como propietario)
  async confirmRequest(requestId: number): Promise<Request> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const requestIndex = MOCK_REQUESTS.findIndex(req => req.id === requestId);
          if (requestIndex >= 0) {
            const updatedRequest = {
              ...MOCK_REQUESTS[requestIndex],
              status: 'confirmed' as RequestStatus,
              updated_at: new Date().toISOString()
            };
            MOCK_REQUESTS[requestIndex] = updatedRequest;
            resolve(updatedRequest);
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.post<Request>(`/api/requests/sus-solicitudes/${requestId}/confirmar`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al confirmar solicitud');
    }
  },

  // Rechazar solicitud (como propietario)
  async rejectRequest(requestId: number): Promise<Request> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const requestIndex = MOCK_REQUESTS.findIndex(req => req.id === requestId);
          if (requestIndex >= 0) {
            const updatedRequest = {
              ...MOCK_REQUESTS[requestIndex],
              status: 'rejected' as RequestStatus,
              updated_at: new Date().toISOString()
            };
            MOCK_REQUESTS[requestIndex] = updatedRequest;
            resolve(updatedRequest);
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.post<Request>(`/api/requests/sus-solicitudes/${requestId}/rechazar`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al rechazar solicitud');
    }
  },

  // Confirmar devolución (como propietario)
  async confirmReturn(requestId: number): Promise<Request> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const requestIndex = MOCK_REQUESTS.findIndex(req => req.id === requestId);
          if (requestIndex >= 0) {
            const updatedRequest = {
              ...MOCK_REQUESTS[requestIndex],
              status: 'completed' as RequestStatus,
              updated_at: new Date().toISOString()
            };
            MOCK_REQUESTS[requestIndex] = updatedRequest;
            resolve(updatedRequest);
          } else {
            reject(new Error('Solicitud no encontrada'));
          }
        }, 600);
      });
    }
    
    try {
      const response = await api.post<Request>(`/api/requests/sus-solicitudes/${requestId}/confirmar-devolucion`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al confirmar devolución');
    }
  },

  // Helper para obtener nombre del estado en español
  getStatusName(status: RequestStatus): string {
    const statusNames: Record<RequestStatus, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      paid: 'Pagado',
      delivered: 'Entregado',
      returned: 'Devuelto',
      completed: 'Completado',
      rejected: 'Rechazado',
      canceled: 'Cancelado'
    };
    
    return statusNames[status] || status;
  },

  // Helper para obtener color del estado
  getStatusColor(status: RequestStatus): string {
    const statusColors: Record<RequestStatus, string> = {
      pending: '#FF9800',   // Naranja
      confirmed: '#2196F3',  // Azul
      paid: '#4CAF50',      // Verde
      delivered: '#8BC34A',  // Verde claro
      returned: '#9C27B0',   // Púrpura
      completed: '#009688',  // Verde turquesa
      rejected: '#F44336',   // Rojo
      canceled: '#9E9E9E'    // Gris
    };
    
    return statusColors[status] || '#000000';
  },

  // Helper para obtener la etapa del proceso (0-4)
  getStatusStage(status: RequestStatus): number {
    const statusStages: Record<RequestStatus, number> = {
      pending: 0,
      confirmed: 1,
      paid: 2,
      delivered: 3,
      returned: 4,
      completed: 5,
      rejected: -1,
      canceled: -1
    };
    
    return statusStages[status];
  }
};

export default requestService;