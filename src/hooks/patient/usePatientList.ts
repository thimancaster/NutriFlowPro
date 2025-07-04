
import { useState, useCallback, useEffect } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient, PatientFilters } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

interface UsePatientListOptions {
  pageSize?: number;
  initialPage?: number;
  searchFilter?: string;
}

export const usePatientList = (options: UsePatientListOptions = {}) => {
  const { 
    patients, 
    totalPatients, 
    isLoading, 
    error, 
    refreshPatients,
    updateFilters,
    currentFilters
  } = usePatient();
  
  const { pageSize = 10, initialPage = 1, searchFilter = '' } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(searchFilter);
  // Use filters from context instead of local state
  const filters = currentFilters;

  // Debounce search to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update filters when debounced search term changes
  useEffect(() => {
    updateFilters({ search: debouncedSearchTerm });
    setCurrentPage(1); // Reset to first page on search
  }, [debouncedSearchTerm, updateFilters]);

  // Server-side filtering and pagination is now handled by the API
  const filteredPatients = patients;
  
  // For server-side pagination, we use all returned patients
  const paginatedPatients = patients;
  
  const totalPages = Math.ceil(totalPatients / pageSize);

  // Update server-side pagination when page changes
  useEffect(() => {
    updateFilters({ page: currentPage, limit: pageSize });
  }, [currentPage, pageSize, updateFilters]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
    // debounced search will trigger the server-side search
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    updateFilters(newFilters);
    setCurrentPage(1);
  }, [updateFilters]);

  const handleStatusChange = useCallback((status: 'active' | 'archived' | 'all' | '') => {
    const mappedStatus = status === 'all' ? '' : status;
    handleFilterChange({ status: mappedStatus });
  }, [handleFilterChange]);

  const refetch = useCallback(async () => {
    await refreshPatients();
  }, [refreshPatients]);

  const pagination = {
    currentPage,
    totalPages,
    pageSize,
    total: totalPatients
  };

  return {
    // Data
    patients: paginatedPatients,
    allPatients: patients,
    filteredPatients,
    totalPatients: totalPatients,
    totalAllPatients: totalPatients,
    
    // State
    isLoading,
    error,
    currentPage,
    totalPages,
    pageSize,
    searchTerm,
    filters,
    pagination,
    
    // Actions
    handleSearch,
    handlePageChange,
    handleFilterChange,
    handleStatusChange,
    refetch,
    setCurrentPage,
    setSearchTerm,
  };
};
