
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePatient } from '@/hooks/usePatient';
import { Patient, PaginationParams, PatientFilters } from '@/types';
import { getPatients } from '@/services/patient/operations/getPatients';

export const usePatientList = (initialPagination: PaginationParams = { page: 0, perPage: 10 }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationParams>(initialPagination);
  const [filters, setFilters] = useState<PatientFilters>({});
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
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when pagination or filters change
  useEffect(() => {
    fetchPatients();
  }, [pagination.page, pagination.perPage, JSON.stringify(filters)]);

  const handlePageChange = (newPage: number) => {
    setPagination({...pagination, page: newPage});
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPagination({page: 0, perPage: newPerPage});
  };

  const handleFilterChange = (newFilters: PatientFilters) => {
    setFilters(newFilters);
    setPagination({...pagination, page: 0}); // Reset to first page on filter change
  };

  return {
    patients,
    isLoading,
    error,
    totalPatients,
    pagination,
    filters,
    handlePageChange,
    handlePerPageChange,
    handleFilterChange,
    refreshPatients: fetchPatients,
    activePatient,
    setActivePatient
  };
};
