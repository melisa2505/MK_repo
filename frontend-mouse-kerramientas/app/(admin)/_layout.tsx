import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.is_superuser) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Panel de Administración',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="tools" 
        options={{ 
          title: 'Gestión de Herramientas',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="logs" 
        options={{ 
          title: 'Logs de Actividad',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff'
        }} 
      />
      <Stack.Screen 
        name="backup" 
        options={{ 
          title: 'Backup y Configuración',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff'
        }} 
      />
    </Stack>
  );
}
