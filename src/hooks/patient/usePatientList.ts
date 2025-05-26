
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Patient, PatientFilters } from '@/types';
import { getPatients, PatientsFilters } from '@/services/patient/operations/getPatients';
import { useToast } from '@/hooks/use-toast';

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const usePatientList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros e paginação
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  const fetchPatients = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Otimização: Usar filtros para reduzir dados transferidos
      const patientsFilters: PatientsFilters = {
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const result = await getPatients(
        user.id,
        patientsFilters,
        pagination.page,
        pagination.pageSize
      );

      if (result.success && result.data) {
        setPatients(result.data);
        setPagination(prev => ({
          ...prev,
          total: result.total || 0,
          totalPages: Math.ceil((result.total || 0) / prev.pageSize)
        }));
      } else {
        setError(result.error || 'Erro ao carregar pacientes');
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao carregar pacientes',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao carregar pacientes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar pacientes quando filtros ou paginação mudam
  useEffect(() => {
    fetchPatients();
  }, [user?.id, filters, pagination.page]);

  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset para primeira página quando filtros mudam
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = () => {
    // Recarregar lista após mudança de status
    fetchPatients();
  };

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
    refetch: fetchPatients
  };
};
