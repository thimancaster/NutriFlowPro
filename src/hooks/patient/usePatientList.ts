
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFilters, PaginationParams } from '@/types';
import { useAuth } from '@/contexts/auth/AuthContext';

export const usePatientList = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize with default filters
  const [filters, setFilters] = useState<PatientFilters>({
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    pageSize: 10
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    total: 0,
    offset: 0
  });

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user, filters]);

  // Fetch patients based on current filters
  const fetchPatients = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate offset based on page and pageSize
      const offset = ((filters.page || 1) - 1) * (filters.pageSize || 10);
      
      // Start building the query
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      // Apply status filter if not set to 'all'
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Apply search filter if provided
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }
      
      // Apply date range filters if provided
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString().split('T')[0]);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        query = query.order(filters.sortBy, { 
          ascending: filters.sortOrder === 'asc' 
        });
      }
      
      // Apply pagination
      query = query.range(offset, offset + (filters.pageSize || 10) - 1);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw new Error(error.message);
      
      // Update pagination with total count
      setPagination({
        page: filters.page || 1,
        limit: filters.pageSize || 10,
        total: count || 0,
        offset
      });
      
      setPatients(data || []);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to update filters
  const updateFilters = (newFilters: Partial<PatientFilters>) => {
    // Reset to page 1 when changing filters
    if (newFilters.search || newFilters.status || newFilters.sortBy || 
        newFilters.sortOrder || newFilters.startDate || newFilters.endDate) {
      newFilters.page = 1;
    }
    
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Function to handle page changes
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };
  
  // Function to handle page size changes
  const handlePageSizeChange = (pageSize: number) => {
    updateFilters({ pageSize, page: 1 });
  };
  
  // Calculate total pages
  const totalPages = Math.ceil((pagination.total || 0) / (filters.pageSize || 10));
  
  // Function to archive/unarchive a patient
  const togglePatientStatus = async (patientId: string, newStatus: 'active' | 'archived') => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    
    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: newStatus })
        .eq('id', patientId)
        .eq('user_id', user.id);
      
      if (error) throw new Error(error.message);
      
      // Refresh the patient list
      await fetchPatients();
      
      return { success: true };
    } catch (err: any) {
      console.error('Error toggling patient status:', err);
      return { success: false, error: err.message };
    }
  };

  return {
    patients,
    isLoading,
    error,
    filters,
    pagination: {
      page: filters.page || 1,
      pageSize: filters.pageSize || 10,
      total: pagination.total || 0,
      totalPages
    },
    updateFilters,
    handlePageChange,
    handlePageSizeChange,
    fetchPatients,
    togglePatientStatus
  };
};
