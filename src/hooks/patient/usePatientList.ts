
import { useState, useEffect, useCallback } from 'react';
import { Patient, PatientFilters, PatientListResponse } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getPatients } from '@/services/patient/operations/getPatients';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface UsePatientListReturn {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  filters: PatientFilters;
  pagination: PaginationInfo;
  totalPatients: number;
  handleFilterChange: (newFilters: Partial<PatientFilters>) => void;
  handlePageChange: (page: number) => void;
  handleStatusChange: (status: 'active' | 'archived' | '') => void;
  refetch: () => Promise<void>;
}

const defaultFilters: PatientFilters = {
  status: '',
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  limit: 10
};

export const usePatientList = (): UsePatientListReturn => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    pageSize: 10
  });

  const fetchPatients = useCallback(async () => {
    if (!user?.id) {
      setPatients([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching patients with filters:', filters);
      
      const response = await getPatients(
        user.id,
        {
          search: filters.search,
          status: filters.status === '' ? 'all' : (filters.status as 'active' | 'archived' | 'all'),
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        },
        filters.page || 1,
        filters.limit || 10
      );

      if (response.success && response.data) {
        setPatients(response.data);
        const total = response.total || 0;
        const pageSize = filters.limit || 10;
        
        setPagination({
          currentPage: filters.page || 1,
          totalPages: Math.ceil(total / pageSize),
          total,
          pageSize
        });
      } else {
        setError(response.error || 'Erro ao carregar pacientes');
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Erro ao carregar pacientes');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, filters]);

  // Fetch data when user or filters change
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleStatusChange = useCallback((status: 'active' | 'archived' | '') => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchPatients();
  }, [fetchPatients]);

  return {
    patients,
    isLoading,
    error,
    filters,
    pagination,
    totalPatients: pagination.total,
    handleFilterChange,
    handlePageChange,
    handleStatusChange,
    refetch
  };
};
