
import { useState, useEffect, useCallback } from 'react';
import { Patient, PatientFilters, PatientListResponse } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatientFetching } from './usePatientFetching';
import { usePatientFilters } from './usePatientFilters';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

interface UsePatientListReturn {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  filters: PatientFilters;
  pagination: PaginationInfo;
  totalPatients: number;
  handleFilterChange: (newFilters: Partial<PatientFilters>) => void;
  handlePageChange: (page: number) => void;
  handleStatusChange: (status: 'active' | 'archived' | '') => void;
  refetch: () => Promise<void>;
}

export const usePatientList = (): UsePatientListReturn => {
  const { user } = useAuth();
  const { filters, updateFilters, handleStatusChange } = usePatientFilters();
  const { patients, isLoading, error, fetchPatients } = usePatientFetching(user?.id);
  const [response, setResponse] = useState<PatientListResponse>({
    patients: [],
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10
  });

  // Fetch data whenever filters change
  useEffect(() => {
    if (user?.id) {
      fetchPatients(filters).then(setResponse);
    }
  }, [user?.id, filters, fetchPatients]);

  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  const refetch = useCallback(async () => {
    if (user?.id) {
      const newResponse = await fetchPatients(filters);
      setResponse(newResponse);
    }
  }, [user?.id, filters, fetchPatients]);

  return {
    patients: response.patients,
    isLoading,
    error: error || null,
    filters,
    pagination: {
      currentPage: response.page,
      totalPages: response.totalPages,
      total: response.total,
      pageSize: response.limit
    },
    totalPatients: response.total,
    handleFilterChange,
    handlePageChange,
    handleStatusChange,
    refetch
  };
};
