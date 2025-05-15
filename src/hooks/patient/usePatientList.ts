
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFilters, PaginationParams } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';
import { logger } from '@/utils/logger';

interface UsePatientListProps {
  initialFilters?: Partial<PatientFilters>;
  initialPage?: number;
  initialPageSize?: number;
}

export const usePatientList = (initialProps?: UsePatientListProps) => {
  const { user } = useAuth();
  const initialFilters = initialProps?.initialFilters || {};
  const initialPage = initialProps?.initialPage || 1;
  const initialPageSize = initialProps?.initialPageSize || 10;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [filters, setFilters] = useState<PatientFilters>({
    search: initialFilters.search || '',
    status: initialFilters.status || 'active',
    sortBy: initialFilters.sortBy || 'name',
    sortOrder: initialFilters.sortOrder || 'asc',
    dateFrom: initialFilters.dateFrom || undefined,
    dateTo: initialFilters.dateTo || undefined,
  });
  
  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0
  });

  // Fetch patients from Supabase
  const fetchPatients = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Calculate pagination values
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;

      // Start building the query
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });

      // Filter by user ID
      query = query.eq('user_id', user.id);

      // Filter by status if provided
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply search if provided
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply date range filters if provided
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, {
          ascending: filters.sortOrder === 'asc'
        });
      }

      // Apply pagination
      query = query.range(from, to);

      // Execute the query
      const { data, error, count } = await query;

      if (error) throw new Error(error.message);

      // Process the data
      const processedData = data.map(item => {
        return {
          ...item,
          // Convert string dates to Date objects if needed
          status: item.status || 'active', // Add status field if it doesn't exist
        } as Patient;
      });

      setPatients(processedData);
      
      const total = count || 0;
      setTotalPatients(total);
      
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / pagination.pageSize)
      }));

    } catch (err: any) {
      setError(err);
      logger.error('Error fetching patients:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, pagination.page, pagination.pageSize]);

  // Fetch patients on component mount or when dependencies change
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Handler for changing page
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Handler for changing filters
  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Handler for changing status filter
  const handleStatusChange = useCallback((status: 'active' | 'archived' | 'all') => {
    handleFilterChange({ status });
  }, [handleFilterChange]);

  // Toggle patient status (archive/unarchive)
  const togglePatientStatus = useCallback(async (patientId: string, newStatus: 'active' | 'archived') => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', patientId);
      
      if (error) throw new Error(error.message);
      
      // Update the local state
      setPatients(prev => 
        prev.map(p => 
          p.id === patientId ? { ...p, status: newStatus } : p
        )
      );
      
      return { success: true };
    } catch (err: any) {
      logger.error('Error toggling patient status:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Define isError from error state
  const isError = error !== null;
  
  // Add refetch method
  const refetch = fetchPatients;

  return {
    patients,
    totalPatients,
    isLoading,
    error,
    isError,
    filters,
    pagination,
    handlePageChange,
    handleFilterChange,
    handleStatusChange,
    togglePatientStatus,
    refetch
  };
};
