
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePatient } from '@/hooks/usePatient';
import { Patient, PaginationParams, PatientFilters } from '@/types';
import { getPatients } from '@/services/patient/operations/getPatients';
import { logger } from '@/utils/logger';

export const usePatientList = (initialFilters: PatientFilters = {
  page: 1,
  pageSize: 10,
  status: 'active',
  sortBy: 'name',
  sortOrder: 'asc'
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationParams>({
    limit: initialFilters.pageSize || 10,
    offset: ((initialFilters.page || 1) - 1) * (initialFilters.pageSize || 10)
  });
  const [filters, setFilters] = useState<PatientFilters>(initialFilters);
  const { toast } = useToast();
  const { activePatient, setActivePatient } = usePatient();

  const fetchPatients = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getPatients(pagination, filters);
      if (result.error) {
        setError(result.error.message || "Failed to fetch patients");
        toast({
          title: 'Erro',
          description: result.error.message || "Não foi possível carregar os pacientes",
          variant: 'destructive'
        });
      } else {
        setPatients(result.data);
        setTotalPatients(result.count);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch patients";
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
      logger.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when pagination or filters change
  useEffect(() => {
    fetchPatients();
  }, [pagination.offset, pagination.limit, JSON.stringify(filters)]);

  const handlePageChange = (newPage: number) => {
    setPagination({
      limit: pagination.limit,
      offset: (newPage - 1) * pagination.limit
    });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPagination({
      limit: newPerPage,
      offset: 0
    });
  };

  const handleFilterChange = (newFilters: PatientFilters) => {
    setFilters(newFilters);
    // Reset to first page on filter change
    setPagination(prev => ({...prev, offset: 0}));
  };
  
  const handleStatusChange = (status: 'active' | 'archived' | 'all') => {
    handleFilterChange({
      ...filters,
      status
    });
  };

  return {
    patients,
    isLoading,
    error,
    isError: !!error,
    totalPatients,
    pagination: {
      ...pagination,
      page: Math.floor(pagination.offset / pagination.limit) + 1 // Convert offset to page number
    },
    filters,
    handlePageChange,
    handlePerPageChange,
    handleFilterChange,
    handleStatusChange,
    refreshPatients: fetchPatients,
    activePatient,
    setActivePatient,
    refetch: fetchPatients
  };
};
