
import { useState, useCallback } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient, PatientFilters } from '@/types';

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
    refreshPatients 
  } = usePatient();
  
  const { pageSize = 10, initialPage = 1, searchFilter = '' } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(searchFilter);
  const [filters, setFilters] = useState<PatientFilters>({
    status: 'active',
    search: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: pageSize
  });

  // Filter patients based on search term and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.cpf?.includes(searchTerm);
    
    // Handle status filtering - show all patients if status is empty, 'all', or matches patient status
    let matchesStatus = true;
    if (filters.status && filters.status === 'active') {
      matchesStatus = patient.status === 'active';
    } else if (filters.status && filters.status === 'archived') {
      matchesStatus = patient.status === 'archived';
    }
    
    return matchesSearch && matchesStatus;
  });

  // Paginate filtered patients
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
  
  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

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
    total: filteredPatients.length
  };

  return {
    // Data
    patients: paginatedPatients,
    allPatients: patients,
    filteredPatients,
    totalPatients: filteredPatients.length,
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
