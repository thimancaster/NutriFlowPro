
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFilters, PaginationParams } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const usePatientList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'active',
    dateFrom: '',
    dateTo: '',
    sortBy: 'name',
    sortDirection: 'asc'
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
    total: 0,
    limit: 10,
    offset: 0
  });
  
  const fetchPatients = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      // If we need status filtering (you'd need to add this column to your patients table)
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Date filters if provided
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      
      // Apply user_id filter to only show the user's patients
      query = query.eq('user_id', user.id);
      
      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortDirection === 'asc' 
        });
      }
      
      // Apply pagination
      const { limit, offset } = pagination;
      if (limit && offset !== undefined) {
        query = query.range(offset, offset + limit - 1);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Transform data if needed
      const transformedData = data.map(patient => ({
        ...patient,
        status: patient.status || 'active', // Default to active if not specified
      }));
      
      setPatients(transformedData);
      setTotalPatients(count || 0);
      setPagination(prev => ({ ...prev, total: count || 0 }));
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err as Error);
      setIsError(true);
      
      toast({
        title: 'Error',
        description: `Failed to load patients: ${(err as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, pagination, toast]);
  
  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user, fetchPatients]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1, offset: 0 })); // Reset to first page
  };
  
  // Handle status filter change specifically
  const handleStatusChange = (status: 'active' | 'archived' | 'all') => {
    handleFilterChange({ status });
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    const offset = (page - 1) * pagination.pageSize;
    setPagination(prev => ({ 
      ...prev, 
      page,
      offset,
      limit: prev.pageSize
    }));
  };
  
  // Toggle patient status between active/archived
  const togglePatientStatus = async (patientId: string, newStatus: 'active' | 'archived') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', patientId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setPatients(prev => 
        prev.map(patient => 
          patient.id === patientId 
            ? { ...patient, status: newStatus } 
            : patient
        )
      );
      
      toast({
        title: 'Success',
        description: `Patient ${newStatus === 'active' ? 'activated' : 'archived'} successfully.`,
      });
      
      // Re-fetch to ensure sync with server
      fetchPatients();
    } catch (err) {
      console.error('Error updating patient status:', err);
      
      toast({
        title: 'Error',
        description: `Failed to update patient status: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  };
  
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
