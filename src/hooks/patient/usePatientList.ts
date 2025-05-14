
import { useCallback, useEffect, useState } from 'react';
import { getSortedPatients } from '@/services/patient';
import { Patient, PatientFilters, PaginationParams } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Default filters for the patient list
const defaultFilters: PatientFilters = {
  status: 'active',
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  pageSize: 10
};

export const usePatientList = (initialFilters?: Partial<PatientFilters>) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PatientFilters>({
    ...defaultFilters,
    ...initialFilters
  });

  // Convert PatientFilters to PaginationParams
  const getPaginationParams = useCallback((filters: PatientFilters): PaginationParams => {
    const { page = 1, pageSize = 10 } = filters;
    const offset = (page - 1) * pageSize;
    return {
      limit: pageSize,
      offset,
      page,
      perPage: pageSize
    };
  }, []);

  // Function to fetch patients
  const fetchPatients = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const paginationParams = getPaginationParams(filters);
      
      const result = await getSortedPatients(
        user.id,
        filters.status || 'active',
        filters.sortBy || 'name',
        filters.sortOrder || 'asc',
        filters.search || '',
        filters.startDate,
        filters.endDate,
        paginationParams
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patients');
      }
      
      setPatients(result.data.patients);
      setTotalPatients(result.data.total);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to fetch patients');
      toast({
        title: 'Error',
        description: 'Failed to fetch patients',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, toast, getPaginationParams]);
  
  // Initial fetch and when filters change
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
      // Reset to first page if filters other than pagination change
      ...(Object.keys(newFilters).some(key => !['page', 'pageSize'].includes(key)) 
        ? { page: 1 }
        : {}
      )
    }));
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
  };
  
  // Handle status change (archive/unarchive)
  const handleStatusChange = () => {
    // Refetch without changing filters to reflect the status change
    fetchPatients();
  };
  
  const isError = error !== null;
  
  return {
    patients,
    totalPatients,
    isLoading,
    isError,
    error,
    filters,
    refetch: fetchPatients,
    handleFilterChange,
    handlePageChange,
    handleStatusChange
  };
};
