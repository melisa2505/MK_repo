import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { FilterOptions, SearchParams, ToolCondition, Tool as ToolType } from '../types/tool';

// Configuración base de la API - CAMBIA ESTA IP POR LA DE TU COMPUTADORA
const API_BASE_URL = 'http://localhost:8000'; // Para desarrollo local
// const API_BASE_URL = 'http://192.168.1.100:8000'; // Para testing en dispositivo físico

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
  is_superuser?: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}

export interface Tool {
  id: number;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  category: string;
  daily_price: number;
  condition: string;
  is_available: boolean;
  image_url?: string;
}

export interface ToolCreate {
  name: string;
  description: string;
  brand: string;
  model: string;
  category: string;
  daily_price: number;
  condition: ToolCondition;
  image_url?: string;
}

export interface ToolUpdate {
  name?: string;
  description?: string;
  brand?: string;
  model?: string;
  category?: string;
  daily_price?: number;
  condition?: ToolCondition;
  is_available?: boolean;
  image_url?: string;
}

export interface AdminLog {
  id: number;
  admin_id: number;
  admin_username: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface BackupConfig {
  id: number;
  name: string;
  description?: string;
  config_data: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BackupConfigCreate {
  name: string;
  description?: string;
  config_data: string;
}

export interface BackupConfigUpdate {
  name?: string;
  description?: string;
  config_data?: string;
  is_active?: boolean;
}

export interface ToolStats {
  total_tools: number;
  available_tools: number;
  rented_tools: number;
  tools_by_category: Record<string, number>;
  tools_by_condition: Record<string, number>;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  recent_registrations: number;
}

export interface AdminDashboard {
  tool_stats: ToolStats;
  user_stats: UserStats;
  recent_logs: AdminLog[];
}

export interface BackupFile {
  filename: string;
  size: number;
  created_at: string;
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

export const adminService = {
  async getDashboard(): Promise<AdminDashboard> {
    try {
      const response = await api.get<AdminDashboard>('/api/admin/dashboard');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener dashboard');
    }
  },

  async getLogs(skip = 0, limit = 100): Promise<AdminLog[]> {
    try {
      const response = await api.get<AdminLog[]>(`/api/admin/logs?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener logs');
    }
  },

  async getBackupConfigs(skip = 0, limit = 100): Promise<BackupConfig[]> {
    try {
      const response = await api.get<BackupConfig[]>(`/api/admin/backup-configs?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener configuraciones');
    }
  },

  async createBackupConfig(config: BackupConfigCreate): Promise<BackupConfig> {
    try {
      const response = await api.post<BackupConfig>('/api/admin/backup-configs', config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al crear configuración');
    }
  },

  async updateBackupConfig(id: number, config: BackupConfigUpdate): Promise<BackupConfig> {
    try {
      const response = await api.put<BackupConfig>(`/api/admin/backup-configs/${id}`, config);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al actualizar configuración');
    }
  },

  async deleteBackupConfig(id: number): Promise<void> {
    try {
      await api.delete(`/api/admin/backup-configs/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al eliminar configuración');
    }
  },

  async createBackup(): Promise<{ message: string; filename: string }> {
    try {
      const response = await api.post('/api/admin/backup/create');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al crear backup');
    }
  },

  async listBackups(): Promise<{ backups: BackupFile[] }> {
    try {
      const response = await api.get('/api/admin/backup/list');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al listar backups');
    }
  },

  async restoreBackup(filename: string): Promise<{ message: string }> {
    try {
      const response = await api.post(`/api/admin/backup/restore/${filename}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al restaurar backup');
    }
  },
};

// Servicios de herramientas
export const toolsService = {
  async getTools(): Promise<ToolType[]> {
    try {
      const response = await api.get<ToolType[]>('/api/tools');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener herramientas');
    }
  },

  async searchTools(params: SearchParams): Promise<ToolType[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.q) queryParams.append('q', params.q);
      if (params.category) queryParams.append('category', params.category);
      if (params.brand) queryParams.append('brand', params.brand);
      if (params.condition) queryParams.append('condition', params.condition);
      if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString());
      if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString());
      if (params.available !== undefined) queryParams.append('available', params.available.toString());
      if (params.skip) queryParams.append('skip', params.skip.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await api.get<ToolType[]>(`/api/tools/search?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al buscar herramientas');
    }
  },

  async getFilterOptions(): Promise<FilterOptions> {
    try {
      const response = await api.get<FilterOptions>('/api/tools/filters/options');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener opciones de filtro');
    }
  },

  async getTool(id: number): Promise<Tool> {
    try {
      const response = await api.get<Tool>(`/api/tools/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al obtener herramienta');
    }
  },

  async createTool(tool: ToolCreate): Promise<Tool> {
    try {
      const response = await api.post<Tool>('/api/tools', tool);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al crear herramienta');
    }
  },

  async updateTool(id: number, tool: ToolUpdate): Promise<Tool> {
    try {
      const response = await api.put<Tool>(`/api/tools/${id}`, tool);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al actualizar herramienta');
    }
  },

  async deleteTool(id: number): Promise<void> {
    try {
      await api.delete(`/api/tools/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Error al eliminar herramienta');
    }
  },
};

export default api;