
import { useState, useCallback } from 'react';
import { PatientFilters } from '@/types';

/**
 * Hook for managing patient filter state
 */
export const usePatientFilters = (initialFilters?: Partial<PatientFilters>) => {
  // Filters state
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'active',
    dateFrom: initialFilters?.dateFrom || '',
    dateTo: initialFilters?.dateTo || '',
    sortBy: initialFilters?.sortBy || 'name',
    sortDirection: initialFilters?.sortDirection || 'asc'
  });

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle status filter change specifically
  const handleStatusChange = useCallback((status: 'active' | 'archived' | 'all') => {
    handleFilterChange({ status });
  }, [handleFilterChange]);

  return {
    filters,
    handleFilterChange,
    handleStatusChange,
  };
};
