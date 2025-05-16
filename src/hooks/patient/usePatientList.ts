
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { PatientFilters } from '@/types';

// Import the extracted hooks
import { usePatientFilters } from './usePatientFilters';
import { usePatientPagination } from './usePatientPagination';
import { usePatientFetching } from './usePatientFetching';
import { usePatientStatusToggle } from './usePatientStatusToggle';

/**
 * Unified hook for patient list management
 */
export const usePatientList = (options?: {
  initialFilters?: Partial<PatientFilters>;
  initialPage?: number;
  initialPageSize?: number;
}) => {
  const { user } = useAuth();
  
  // Use the extracted hooks
  const { filters, handleFilterChange, handleStatusChange } = usePatientFilters(options?.initialFilters);
  const { pagination, handlePageChange, updateTotalItems } = usePatientPagination({
    initialPage: options?.initialPage,
    initialPageSize: options?.initialPageSize
  });
  
  const {
    patients,
    totalPatients,
    isLoading,
    error,
    isError,
    fetchPatients,
    debouncedFetch
  } = usePatientFetching(user?.id, filters, pagination);

  // Update total items whenever it changes
  if (pagination.total !== totalPatients) {
    updateTotalItems(totalPatients);
  }
  
  const refetch = useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handle filter changes with page reset
  const handleFilterChangeWithPageReset = useCallback((newFilters: Partial<PatientFilters>) => {
    handleFilterChange(newFilters);
    handlePageChange(1); // Reset to first page
    debouncedFetch(300);
  }, [handleFilterChange, handlePageChange, debouncedFetch]);
  
  // Use the toggle status hook with refetch callback
  const { togglePatientStatus } = usePatientStatusToggle(user?.id, refetch);
  
  return {
    patients,
    totalPatients,
    isLoading,
    error,
    isError,
    filters,
    pagination,
    handlePageChange,
    handleFilterChange: handleFilterChangeWithPageReset,
    handleStatusChange: useCallback((status) => {
      handleStatusChange(status);
      handlePageChange(1); // Reset to page 1
      debouncedFetch(300);
    }, [handleStatusChange, handlePageChange, debouncedFetch]),
    togglePatientStatus,
    refetch
  };
};
