import api from './api';

// Interfaces para chats y mensajes
export interface Chat {
  id: number;
  owner_id: number;
  consumer_id: number;
  tool_id: number;
  created_at: string;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number | null;
  content: string;
  timestamp: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface RequestDates {
  start_date: string;
  end_date: string;
}

// Modo de simulación - Cambiar a false para usar API real
const USE_MOCK_DATA = true;

// Datos de prueba para chats
const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    owner_id: 2,
    consumer_id: 1,
    tool_id: 1,
    created_at: '2025-07-10T15:30:22Z',
  },
  {
    id: 2,
    owner_id: 3,
    consumer_id: 1,
    tool_id: 2,
    created_at: '2025-07-12T09:45:11Z',
  },
  {
    id: 3,
    owner_id: 5,
    consumer_id: 2,
    tool_id: 6,
    created_at: '2025-07-13T18:22:05Z',
  },
];

// Datos de prueba para mensajes
const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      chat_id: 1,
      sender_id: 1, // Consumer
      content: 'Hola, estoy interesado en alquilar el taladro. ¿Está disponible para este fin de semana?',
      timestamp: '2025-07-10T15:30:22Z',
    },
    {
      id: 2,
      chat_id: 1,
      sender_id: 2, // Owner
      content: '¡Hola! Sí, el taladro está disponible. ¿Para qué días lo necesitas exactamente?',
      timestamp: '2025-07-10T15:35:45Z',
    },
    {
      id: 3,
      chat_id: 1,
      sender_id: 1, // Consumer
      content: 'Lo necesitaría desde el viernes hasta el domingo.',
      timestamp: '2025-07-10T15:40:12Z',
    },
    {
      id: 4,
      chat_id: 1,
      sender_id: 2, // Owner
      content: 'Perfecto, no hay problema. ¿Podrías hacer la solicitud formal a través de la app?',
      timestamp: '2025-07-10T15:42:30Z',
    }
  ],
  2: [
    {
      id: 5,
      chat_id: 2,
      sender_id: 1, // Consumer
      content: 'Buenas tardes, ¿la sierra circular está en buen estado?',
      timestamp: '2025-07-12T09:45:11Z',
    },
    {
      id: 6,
      chat_id: 2,
      sender_id: 3, // Owner
      content: 'Hola, sí, está en perfectas condiciones. La compré hace 6 meses y la he usado muy poco.',
      timestamp: '2025-07-12T09:50:22Z',
    },
    {
      id: 7,
      chat_id: 2,
      sender_id: 1, // Consumer
      content: '¿Incluye algún accesorio adicional?',
      timestamp: '2025-07-12T09:52:45Z',
    }
  ],
  3: [
    {
      id: 8,
      chat_id: 3,
      sender_id: 1, // Consumer
      content: 'Hola, me gustaría saber si la soldadora está disponible para alquiler la próxima semana.',
      timestamp: '2025-07-13T18:22:05Z',
    }
  ]
};

// Servicios para chats
export const chatService = {
  // Obtener todos los chats del usuario
  async getUserChats(userId: number): Promise<Chat[]> {
    // Si estamos en modo de simulación, devolvemos los datos de prueba
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        // Simulamos una pequeña demora para imitar la llamada a API
        setTimeout(() => {
          // Filtramos chats donde el usuario es propietario o consumidor
          const userChats = MOCK_CHATS.filter(
            chat => chat.owner_id === userId || chat.consumer_id === userId
          );
          resolve(userChats);
        }, 800);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.get<Chat[]>(`/api/chats/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener chats');
    }
  },

  // Obtener detalles de un chat específico con sus mensajes
  async getChatDetail(chatId: number): Promise<ChatWithMessages> {
    // Si estamos en modo de simulación, devolvemos un dato de prueba
    if (USE_MOCK_DATA) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const chat = MOCK_CHATS.find(c => c.id === chatId);
          if (chat) {
            const messages = MOCK_MESSAGES[chatId] || [];
            resolve({ ...chat, messages });
          } else {
            reject(new Error('Chat no encontrado'));
          }
        }, 600);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.get<ChatWithMessages>(`/api/chats/${chatId}/detail`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener detalles del chat');
    }
  },

  // Enviar un mensaje en un chat
  async sendMessage(chatId: number, senderId: number, content: string): Promise<Message> {
    // Si estamos en modo de simulación, simulamos el envío de un mensaje
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newMessageId = Math.max(
            ...Object.values(MOCK_MESSAGES).flat().map(m => m.id)
          ) + 1;
          
          const newMessage: Message = {
            id: newMessageId,
            chat_id: chatId,
            sender_id: senderId,
            content,
            timestamp: new Date().toISOString()
          };
          
          // Agregamos el mensaje a los datos de prueba
          if (!MOCK_MESSAGES[chatId]) {
            MOCK_MESSAGES[chatId] = [];
          }
          MOCK_MESSAGES[chatId].push(newMessage);
          
          resolve(newMessage);
        }, 500);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.post<Message>(`/api/chats/${chatId}/mensaje`, {
        chat_id: chatId,
        sender_id: senderId,
        content
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al enviar mensaje');
    }
  },

  // Crear una solicitud de alquiler desde el chat
  async requestRental(
    chatId: number, 
    toolId: number, 
    ownerId: number, 
    consumerId: number,
    startDate: string,
    endDate: string,
    totalAmount: number
  ) {
    // Si estamos en modo de simulación
    if (USE_MOCK_DATA) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: Math.floor(Math.random() * 1000),
            tool_id: toolId,
            owner_id: ownerId,
            consumer_id: consumerId,
            start_date: startDate,
            end_date: endDate,
            total_amount: totalAmount,
            status: 'pendiente',
            created_at: new Date().toISOString()
          });
        }, 800);
      });
    }
    
    // Si no, usamos la API real
    try {
      const response = await api.post(`/api/chats/${chatId}/solicitar-alquiler`, {
        tool_id: toolId,
        owner_id: ownerId,
        consumer_id: consumerId,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalAmount
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al solicitar alquiler');
    }
  },

  // Calcular el costo total del alquiler según las fechas
  calculateRentalCost(dailyPrice: number, startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Mínimo 1 día
    return dailyPrice * diffDays;
  }
};

export default chatService;