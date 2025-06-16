import { useCallback, useState } from 'react';
import { rentalsService } from '../services/api';
import { RentalCreate, RentalReturn, RentalStats, RentalWithDetails } from '../types/rental';

export const useRentals = () => {
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [activeRentals, setActiveRentals] = useState<RentalWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyRentals = useCallback(async (skip = 0, limit = 100) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rentalsService.getMyRentals(skip, limit);
      setRentals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alquileres');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyActiveRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rentalsService.getMyActiveRentals();
      setActiveRentals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alquileres activos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRental = useCallback(async (rental: RentalCreate) => {
    try {
      setLoading(true);
      setError(null);
      const newRental = await rentalsService.createRental(rental);
      await fetchMyRentals();
      await fetchMyActiveRentals();
      return newRental;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear alquiler');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyRentals, fetchMyActiveRentals]);

  const returnRental = useCallback(async (rentalId: number, returnData: RentalReturn) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRental = await rentalsService.returnRental(rentalId, returnData);
      await fetchMyRentals();
      await fetchMyActiveRentals();
      return updatedRental;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al devolver herramienta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyRentals, fetchMyActiveRentals]);

  const cancelRental = useCallback(async (rentalId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedRental = await rentalsService.cancelRental(rentalId);
      await fetchMyRentals();
      await fetchMyActiveRentals();
      return updatedRental;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar alquiler');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMyRentals, fetchMyActiveRentals]);

  return {
    rentals,
    activeRentals,
    loading,
    error,
    fetchMyRentals,
    fetchMyActiveRentals,
    createRental,
    returnRental,
    cancelRental,
  };
};

export const useRentalStats = () => {
  const [stats, setStats] = useState<RentalStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rentalsService.getRentalStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};
