
import { useState } from 'react';
import { PatientFilters } from '@/types/patient';

export interface UsePatientFiltersReturn {
  filters: PatientFilters;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  setStatusFilter: (status: PatientFilters['status']) => void;
  setSearchTerm: (term: string) => void;
}

export const usePatientFilters = (): UsePatientFiltersReturn => {
  const [filters, setFilters] = useState<PatientFilters>({
    status: 'all',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  const setStatusFilter = (status: PatientFilters['status']) => {
    setFilters(prev => ({ ...prev, status }));
    setCurrentPage(1);
  };

  const setSearchTerm = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setCurrentPage(1);
  };

  return {
    filters,
    currentPage,
    setCurrentPage,
    setStatusFilter,
    setSearchTerm
  };
};
