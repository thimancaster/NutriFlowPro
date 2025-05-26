
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientService } from '@/services/patient';
import { Patient, PatientFilters } from '@/types/patient';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

interface UsePatientListReturn {
  patients: Patient[];
  isLoading: boolean;
  error: string;
  filters: PatientFilters;
  pagination: PaginationInfo;
  totalPatients: number;
  handleFilterChange: (newFilters: Partial<PatientFilters>) => void;
  handlePageChange: (newPage: number) => void;
  handleStatusChange: () => void;
  refetch: () => Promise<void>;
}

export const usePatientList = (): UsePatientListReturn => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalPatients, setTotalPatients] = useState(0);
  
  const [filters, setFilters] = useState<PatientFilters>({
    status: '',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10
  });

  const fetchPatients = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await PatientService.getPatients(user.id, {
        status: filters.status || undefined,
        search: filters.search || undefined,
        sortBy: filters.sortBy as 'name' | 'created_at' | 'updated_at',
        sortOrder: filters.sortOrder || 'asc',
        page: filters.page || 1,
        limit: filters.limit || 10
      });
      
      if (result.success && result.data) {
        setPatients(result.data.patients || []);
        setTotalPatients(result.data.total || 0);
        setPagination({
          currentPage: result.data.page || 1,
          totalPages: result.data.totalPages || 1,
          totalCount: result.data.total || 0,
          pageSize: result.data.limit || 10
        });
      } else {
        setError(result.error || 'Erro ao carregar pacientes');
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Erro inesperado ao carregar pacientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = () => {
    fetchPatients();
  };

  useEffect(() => {
    fetchPatients();
  }, [user, filters]);

  return {
    patients,
    isLoading,
    error,
    filters,
    pagination,
    totalPatients,
    handleFilterChange,
    handlePageChange,
    handleStatusChange,
    refetch: fetchPatients
  };
};
