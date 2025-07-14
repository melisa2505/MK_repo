import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppLayout from '../../components/AppLayout';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { Request, requestService } from '../../services/request_services';

export default function RequestsScreen() {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [ownerRequests, setOwnerRequests] = useState<Request[]>([]);
  const [activeTab, setActiveTab] = useState<'my' | 'owner'>('my');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      if (!user) {
        setError('Necesitas iniciar sesión para ver tus solicitudes');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [myRequestsData, ownerRequestsData] = await Promise.all([
          requestService.getMyRequests(user.id),
          requestService.getOwnerRequests(user.id)
        ]);

        setMyRequests(myRequestsData);
        setOwnerRequests(ownerRequestsData);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar solicitudes:', err);
        setError('No se pudieron cargar las solicitudes. Intente nuevamente.');
        setLoading(false);
      }
    };

    loadRequests();
  }, [user]);

  const renderRequestItem = ({ item }: { item: Request }) => {
    const statusColor = requestService.getStatusColor(item.status);
    const statusName = requestService.getStatusName(item.status);
    
    // Calcular días restantes o transcurridos
    const today = new Date();
    const startDate = new Date(item.start_date);
    const endDate = new Date(item.end_date);
    
    let dateText = '';
    if (today < startDate) {
      // No ha comenzado aún
      const daysToStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      dateText = `Comienza en ${daysToStart} día(s)`;
    } else if (today > endDate) {
      // Ya terminó
      dateText = 'Alquiler finalizado';
    } else {
      // En curso
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      dateText = `${daysLeft} día(s) restante(s)`;
    }

    return (
      <TouchableOpacity 
        style={styles.requestCard}
        onPress={() => router.push({
          pathname: '/requests/[id]',
          params: { 
            id: item.id.toString(),
            type: activeTab === 'my' ? 'my' : 'owner'
          }
        })}
      >
        <View style={styles.requestHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusName}</Text>
          </View>
          <Text style={styles.requestId}>ID: #{item.id}</Text>
        </View>
        
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle}>
            Herramienta ID: {item.tool_id}
          </Text>
          
          <View style={styles.requestDetail}>
            <MaterialCommunityIcons name="calendar-range" size={16} color={Colors.light.textSecondary} />
            <Text style={styles.requestDate}>
              {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.requestDetail}>
            <MaterialCommunityIcons name="timer-outline" size={16} color={Colors.light.textSecondary} />
            <Text style={styles.requestDate}>{dateText}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total:</Text>
            <Text style={styles.priceValue}>S/. {item.total_amount.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Solicitudes de Alquiler</Text>

        {/* Tabs para cambiar entre mis solicitudes y solicitudes como propietario */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my' && styles.activeTab]}
            onPress={() => setActiveTab('my')}
          >
            <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
              Mis Solicitudes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'owner' && styles.activeTab]}
            onPress={() => setActiveTab('owner')}
          >
            <Text style={[styles.tabText, activeTab === 'owner' && styles.activeTabText]}>
              Solicitudes Recibidas
            </Text>
          </TouchableOpacity>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {!user && (
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : activeTab === 'my' ? (
          myRequests.length > 0 ? (
            <FlatList
              data={myRequests}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRequestItem}
              contentContainerStyle={styles.requestsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={80}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.emptyText}>
                No tienes solicitudes de alquiler
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/')}
              >
                <Text style={styles.browseButtonText}>Explorar herramientas</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          ownerRequests.length > 0 ? (
            <FlatList
              data={ownerRequests}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRequestItem}
              contentContainerStyle={styles.requestsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={80}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.emptyText}>
                No tienes solicitudes de tus herramientas
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/profile')}
              >
                <Text style={styles.browseButtonText}>Gestionar mis herramientas</Text>
              </TouchableOpacity>
            </View>
          )
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
    marginBottom: 16,
    color: Colors.light.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  activeTabText: {
    color: 'white',
  },
  requestsList: {
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  requestId: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  requestDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requestDate: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginRight: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginVertical: 20,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});