
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientFilters } from '@/types';
import { PatientService } from '@/services/patient';

export const usePatientList = (initialFilters: PatientFilters) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PatientFilters>(initialFilters);
  
  const { 
    data: patientsData, 
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients', user?.id, filters],
    queryFn: async () => {
      if (!user) return { data: [], count: 0 };
      
      const result = await PatientService.getPatients(user.id, filters);
        
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patients');
      }
        
      return { data: result.data || [], count: result.count || 0 };
    },
    enabled: !!user,
  });
  
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  const handleFiltersChange = (newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };
  
  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['patients'] });
  };
  
  return {
    patients: patientsData?.data || [],
    totalPatients: patientsData?.count || 0,
    filters,
    isLoading,
    isError,
    error,
    refetch,
    handlePageChange,
    handleFiltersChange,
    handleStatusChange
  };
};
