import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { RentalCard } from '../../components/RentalCard';
import { ReturnForm } from '../../components/ReturnForm';
import { useRentals } from '../../hooks/useRentals';
import { RentalStatus, RentalWithDetails } from '../../types/rental';

export default function MyRentalsScreen() {
  const router = useRouter();
  const {
    rentals,
    loading,
    error,
    fetchMyRentals,
    returnRental,
    cancelRental,
  } = useRentals();

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedRental, setSelectedRental] = useState<RentalWithDetails | null>(null);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    fetchMyRentals();
  }, [fetchMyRentals]);

  const handleRefresh = () => {
    fetchMyRentals();
  };

  const handleReturn = (rental: RentalWithDetails) => {
    setSelectedRental(rental);
    setShowReturnForm(true);
  };

  const handleCancel = (rental: RentalWithDetails) => {
    Alert.alert(
      'Cancelar Alquiler',
      '¿Estás seguro de que deseas cancelar este alquiler?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRental(rental.id);
              Alert.alert('Éxito', 'Alquiler cancelado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar el alquiler');
            }
          },
        },
      ]
    );
  };

  const handleView = (rental: RentalWithDetails) => {
    router.push(`/rentals/${rental.id}`);
  };

  const handleReturnSubmit = async (rentalId: number, returnData: any) => {
    try {
      setReturnLoading(true);
      await returnRental(rentalId, returnData);
      setShowReturnForm(false);
      setSelectedRental(null);
      Alert.alert('Éxito', 'Herramienta devuelta correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la devolución');
    } finally {
      setReturnLoading(false);
    }
  };

  const handleReturnCancel = () => {
    setShowReturnForm(false);
    setSelectedRental(null);
  };

  const filterRentals = (status?: RentalStatus) => {
    if (!status) return rentals;
    return rentals.filter(rental => rental.status === status);
  };

  const [activeFilter, setActiveFilter] = useState<RentalStatus | 'ALL'>('ALL');

  const filteredRentals = activeFilter === 'ALL' ? rentals : filterRentals(activeFilter as RentalStatus);

  if (showReturnForm && selectedRental) {
    return (
      <>
        <Stack.Screen options={{ title: 'Devolver Herramienta' }} />
        <ReturnForm
          rentalId={selectedRental.id}
          toolName={selectedRental.tool_name}
          onSubmit={handleReturnSubmit}
          onCancel={handleReturnCancel}
          loading={returnLoading}
        />
      </>
    );
  }

  const renderRental = ({ item }: { item: RentalWithDetails }) => (
    <RentalCard
      rental={item}
      onReturn={handleReturn}
      onCancel={handleCancel}
      onView={handleView}
    />
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === 'ALL' && styles.activeFilterButton,
        ]}
        onPress={() => setActiveFilter('ALL')}
      >
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === 'ALL' && styles.activeFilterButtonText,
          ]}
        >
          Todos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === RentalStatus.PENDING && styles.activeFilterButton,
        ]}
        onPress={() => setActiveFilter(RentalStatus.PENDING)}
      >
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === RentalStatus.PENDING && styles.activeFilterButtonText,
          ]}
        >
          Pendientes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === RentalStatus.ACTIVE && styles.activeFilterButton,
        ]}
        onPress={() => setActiveFilter(RentalStatus.ACTIVE)}
      >
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === RentalStatus.ACTIVE && styles.activeFilterButtonText,
          ]}
        >
          Activos
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === RentalStatus.RETURNED && styles.activeFilterButton,
        ]}
        onPress={() => setActiveFilter(RentalStatus.RETURNED)}
      >
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === RentalStatus.RETURNED && styles.activeFilterButtonText,
          ]}
        >
          Devueltos
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Mis Alquileres' }} />
      
      {renderFilters()}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredRentals}
        renderItem={renderRental}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeFilter === 'ALL' 
                ? 'No tienes alquileres registrados'
                : `No tienes alquileres ${activeFilter.toLowerCase()}`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  activeFilterButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#fed7d7',
  },
  errorText: {
    color: '#e53e3e',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
});
