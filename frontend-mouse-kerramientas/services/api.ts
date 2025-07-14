import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Configuración base de la API - CAMBIA ESTA IP POR LA DE TU COMPUTADORA
const API_BASE_URL = 'http://localhost:8000'; // Para desarrollo local
//const API_BASE_URL = 'http://192.168.1.26:8000'; // Para testing en dispositivo físico

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado, limpiar storage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// Tipos TypeScript
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  full_name?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

// Servicios de autenticación
export const authService = {
  // Login con JSON
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login-json', credentials);
      const { access_token } = response.data;
      
      // Guardar token
      await AsyncStorage.setItem('access_token', access_token);
      
      // Obtener datos del usuario
      const userResponse = await api.get<User>('/api/auth/me');
      const user = userResponse.data;
      
      // Guardar datos del usuario
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return { user, token: access_token };
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al iniciar sesión');
    }
  },

  // Registro
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await api.post<User>('/api/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al registrar usuario');
    }
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>('/api/auth/me');
      const user = response.data;
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener usuario');
    }
  },

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_data');
  },

  // Verificar si hay sesión guardada
  async getStoredSession(): Promise<{ user: User; token: string } | null> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        // Verificar que el token sigue siendo válido
        try {
          await api.get('/api/auth/test-token');
          return { user, token };
        } catch {
          // Token inválido, limpiar storage
          await this.logout();
          return null;
        }
      }
      return null;
    } catch {
      return null;
    }
  },
};

export default api;