import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { AdminDashboard, adminService } from '../../../services/api';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error al cargar el dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenido, {user?.full_name || user?.username}</Text>
        <Text style={styles.roleText}>Administrador</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboard.tool_stats.total_tools}</Text>
            <Text style={styles.statLabel}>Total Herramientas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboard.tool_stats.available_tools}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboard.user_stats.total_users}</Text>
            <Text style={styles.statLabel}>Total Usuarios</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{dashboard.user_stats.admin_users}</Text>
            <Text style={styles.statLabel}>Administradores</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(admin)/tools')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Gestión de Herramientas</Text>
            <Text style={styles.menuItemSubtitle}>CRUD completo de herramientas</Text>
          </View>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(admin)/logs')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Logs de Actividad</Text>
            <Text style={styles.menuItemSubtitle}>Ver actividades de administradores</Text>
          </View>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(admin)/backup')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Backup y Configuración</Text>
            <Text style={styles.menuItemSubtitle}>Gestionar backups del sistema</Text>
          </View>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentLogsContainer}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        {dashboard.recent_logs.map((log) => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logHeader}>
              <Text style={styles.logAction}>{log.action}</Text>
              <Text style={styles.logDate}>
                {new Date(log.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.logDetails}>
              {log.admin_username} - {log.resource} {log.resource_id}
            </Text>
            {log.details && (
              <Text style={styles.logDescription}>{log.details}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: '#bfdbfe',
  },
  statsContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  recentLogsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  logDate: {
    fontSize: 12,
    color: '#64748b',
  },
  logDetails: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  logDescription: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
});
