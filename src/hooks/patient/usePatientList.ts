
import { useState, useCallback } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { Patient } from '@/types';

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

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.includes(searchTerm)
  );

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

  const refetch = useCallback(async () => {
    await refreshPatients();
  }, [refreshPatients]);

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
    
    // Actions
    handleSearch,
    handlePageChange,
    refetch,
    setCurrentPage,
    setSearchTerm,
  };
};
