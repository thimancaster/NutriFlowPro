
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFilters, PaginationParams } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const usePatientList = (initialFilters?: Partial<PatientFilters>) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize filters with defaults
  const [filters, setFilters] = useState<PatientFilters>({
    search: initialFilters?.search,
    status: initialFilters?.status || 'active',
    sortBy: initialFilters?.sortBy || 'name',
    sortOrder: initialFilters?.sortOrder || 'asc',
    page: initialFilters?.page || 1,
    pageSize: initialFilters?.pageSize || 10,
    startDate: initialFilters?.startDate,
    endDate: initialFilters?.endDate
  });
  
  // Set up pagination
  const [pagination, setPagination] = useState<PaginationParams>({
    page: filters.page || 1,
    pageSize: filters.pageSize || 10,
    total: 0,
    totalPages: 0
  });
  
  const { toast } = useToast();
  
  const fetchPatients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate offset for pagination
      const offset = ((pagination.page - 1) * pagination.pageSize);
      
      // Start building the query
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc'
        });
      }
      
      // Apply pagination
      query = query
        .range(offset, offset + pagination.pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw new Error(error.message);
      
      // Process the data
      const mappedPatients = data.map(patient => {
        return {
          ...patient,
          // Convert string birth_date to Date for display purposes when needed
          birth_date: patient.birth_date,
          // Parse goals from JSON if needed
          goals: typeof patient.goals === 'string' 
            ? JSON.parse(patient.goals) 
            : patient.goals || {}
        } as Patient;
      });
      
      setPatients(mappedPatients);
      
      // Update pagination
      if (count !== null) {
        setPagination({
          ...pagination,
          total: count,
          totalPages: Math.ceil(count / pagination.pageSize)
        });
      }
      
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err);
      toast({
        title: 'Error',
        description: 'Failed to load patients. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);
  
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination({
      ...pagination,
      page
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    setFilters({
      ...filters,
      ...newFilters,
      // Reset to page 1 when filters change
      page: 1
    });
  };
  
  // Handle status change
  const handleStatusChange = (status: 'active' | 'archived' | 'all') => {
    handleFilterChange({
      status,
      page: 1 // Reset to first page
    });
  };
  
  // Toggle patient status
  const togglePatientStatus = async (patientId: string, newStatus: 'active' | 'archived') => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', patientId);
      
      if (error) throw new Error(error.message);
      
      // Update local state
      setPatients(prevPatients => 
        prevPatients.map(patient => 
          patient.id === patientId ? { ...patient, status: newStatus } : patient  
        )
      );
      
      toast({
        title: 'Status updated',
        description: `Patient has been ${newStatus === 'archived' ? 'archived' : 'activated'}.`
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error toggling patient status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update patient status.',
        variant: 'destructive',
      });
      return { success: false, error: err };
    }
  };
  
  const refetchPatients = () => {
    fetchPatients();
  };
  
  return {
    patients,
    isLoading,
    error,
    filters,
    pagination,
    handlePageChange,
    handleFilterChange,
    handleStatusChange,
    togglePatientStatus,
    refetchPatients
  };
};
