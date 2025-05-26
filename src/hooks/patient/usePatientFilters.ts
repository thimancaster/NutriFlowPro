
import { useState, useCallback } from 'react';
import { PatientFilters } from '@/types';

interface UsePatientFiltersReturn {
  filters: PatientFilters;
  updateFilters: (newFilters: Partial<PatientFilters>) => void;
  resetFilters: () => void;
  handleStatusChange: (status: 'active' | 'archived' | '') => void;
}

const defaultFilters: PatientFilters = {
  status: '',
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
  page: 1,
  limit: 10
};

export const usePatientFilters = (): UsePatientFiltersReturn => {
  const [filters, setFilters] = useState<PatientFilters>(defaultFilters);

  const updateFilters = useCallback((newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset to page 1 when filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleStatusChange = useCallback((status: 'active' | 'archived' | '') => {
    updateFilters({ status, page: 1 });
  }, [updateFilters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    handleStatusChange
  };
};
