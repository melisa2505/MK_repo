import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AdminLog, adminService } from '../../../services/api';

export default function LogsScreen() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getLogs();
      setLogs(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return '#10b981';
      case 'UPDATE':
        return '#f59e0b';
      case 'DELETE':
        return '#ef4444';
      case 'BACKUP':
        return '#3b82f6';
      case 'RESTORE':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLog = ({ item }: { item: AdminLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.actionContainer}>
          <View style={[
            styles.actionBadge,
            { backgroundColor: getActionColor(item.action) }
          ]}>
            <Text style={styles.actionText}>{item.action}</Text>
          </View>
          <Text style={styles.resourceText}>{item.resource}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
      </View>
      
      <View style={styles.logContent}>
        <Text style={styles.adminText}>
          Administrador: {item.admin_username}
        </Text>
        {item.resource_id && (
          <Text style={styles.resourceIdText}>
            ID del recurso: {item.resource_id}
          </Text>
        )}
        {item.details && (
          <Text style={styles.detailsText}>{item.details}</Text>
        )}
        {item.ip_address && (
          <Text style={styles.ipText}>IP: {item.ip_address}</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs de Actividad</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
        </TouchableOpacity>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay logs disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderLog}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resourceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  logContent: {
    padding: 16,
  },
  adminText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceIdText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  ipText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
