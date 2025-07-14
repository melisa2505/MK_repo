import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    full_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Modo de desarrollo - Cambiar a false para usar autenticación real
const DEV_MODE = false;

// Usuario de prueba para desarrollo
const TEST_USER: User = {
  id: 1,
  email: 'usuario@example.com',
  username: 'usuario_test',
  full_name: 'Usuario de Prueba',
  is_active: true,
  created_at: new Date().toISOString()
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // En modo desarrollo, inicializar con el usuario de prueba
  const [user, setUser] = useState<User | null>(DEV_MODE ? TEST_USER : null);
  const [isLoading, setIsLoading] = useState(!DEV_MODE); // No mostrar carga en modo dev
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Verificar sesión guardada al iniciar la app (solo si no estamos en modo desarrollo)
  useEffect(() => {
    if (!DEV_MODE) {
      checkStoredSession();
    }
  }, []);

  const checkStoredSession = async () => {
    try {
      setIsLoading(true);
      const session = await authService.getStoredSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error) {
      console.log('No hay sesión guardada');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    // En modo desarrollo, simular un inicio de sesión exitoso
    if (DEV_MODE) {
      return new Promise<void>(resolve => {
        setIsLoading(true);
        setTimeout(() => {
          setUser(TEST_USER);
          setIsLoading(false);
          resolve();
        }, 800);
      });
    }

    try {
      setIsLoading(true);
      setError(null);
      const { user } = await authService.login({ username, password });
      setUser(user);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    full_name?: string;
  }) => {
    // En modo desarrollo, simular un registro exitoso
    if (DEV_MODE) {
      return new Promise<void>(resolve => {
        setIsLoading(true);
        setTimeout(() => {
          setUser({
            ...TEST_USER,
            email: userData.email,
            username: userData.username,
            full_name: userData.full_name || TEST_USER.full_name
          });
          setIsLoading(false);
          resolve();
        }, 1000);
      });
    }

    try {
      setIsLoading(true);
      setError(null);
      await authService.register(userData);
      // Después del registro exitoso, hacer login automático
      await login(userData.username, userData.password);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // En modo desarrollo, simular un cierre de sesión
    if (DEV_MODE) {
      return new Promise<void>(resolve => {
        setIsLoading(true);
        setTimeout(() => {
          setUser(null);
          setIsLoading(false);
          resolve();
        }, 500);
      });
    }

    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};