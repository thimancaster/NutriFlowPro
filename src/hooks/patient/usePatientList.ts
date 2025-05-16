
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientFilters } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Helper function to safely parse JSON fields
const safeParseJson = (jsonField: Json | null, defaultValue: any = {}) => {
  if (!jsonField) return defaultValue;
  if (typeof jsonField === 'object') return jsonField;
  try {
    return JSON.parse(jsonField as string) || defaultValue;
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return defaultValue;
  }
};

export const usePatientList = (options?: {
  initialFilters?: Partial<PatientFilters>;
  initialPage?: number;
  initialPageSize?: number;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);
  
  // Use a ref for tracking fetch operations
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef<number | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'active',
    dateFrom: options?.initialFilters?.dateFrom || '',
    dateTo: options?.initialFilters?.dateTo || '',
    sortBy: options?.initialFilters?.sortBy || 'name',
    sortDirection: options?.initialFilters?.sortDirection || 'asc'
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: options?.initialPage || 1,
    pageSize: options?.initialPageSize || 10,
    total: 0,
    totalPages: 0,
    limit: options?.initialPageSize || 10,
    offset: 0
  });
  
  // Clear fetch timeout to prevent memory leaks
  const clearFetchTimeout = useCallback(() => {
    if (fetchTimeoutRef.current !== null) {
      window.clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
  }, []);
  
  // Debounced fetch function
  const debouncedFetch = useCallback((delay = 300) => {
    clearFetchTimeout();
    
    fetchTimeoutRef.current = window.setTimeout(() => {
      fetchPatients();
    }, delay);
    
    return () => clearFetchTimeout();
  }, [clearFetchTimeout]);
  
  const fetchPatients = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (!user || isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      console.log("Fetching patients with filters:", filters);
      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      // If we need status filtering (you'd need to add this column to your patients table)
      if (filters.status && filters.status !== 'all') {
        // Use placeholder for status if it's not in the database yet
        // query = query.eq('status', filters.status);
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
      
      console.log("Executing query:", JSON.stringify(query));
      const { data, error, count } = await query;
      
      if (error) throw error;
      console.log("Query returned data:", data?.length, "items");
      
      // Transform data to match Patient type
      const transformedData: Patient[] = data?.map(patient => {
        try {
          const measurementsData = safeParseJson(patient.measurements, {});
          const goalsData = safeParseJson(patient.goals, {});
          const addressData = typeof patient.address === 'string' ? 
            safeParseJson(patient.address, {}) : patient.address || {};
          
          return {
            ...patient,
            status: 'active', // Add a default status if not present in the database
            goals: {
              objective: goalsData.objective || '',
              profile: goalsData.profile || '',
            },
            measurements: {
              weight: measurementsData.weight || 0,
              height: measurementsData.height || 0,
            },
            address: addressData
          };
        } catch (err) {
          console.error("Error transforming patient data:", err);
          // Return a basic patient object to prevent the entire list from failing
          return {
            ...patient,
            id: patient.id,
            name: patient.name || 'Unknown Patient',
            status: 'active', // Provide default status
            goals: { objective: '', profile: '' },
            measurements: { weight: 0, height: 0 }
          };
        }
      }) || [];
      
      setPatients(transformedData);
      setTotalPatients(count || 0);
      
      // Calculate total pages
      const totalPages = Math.ceil((count || 0) / pagination.pageSize);
      setPagination(prev => ({ ...prev, total: count || 0, totalPages }));
      console.log("Patient list updated successfully");
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err as Error);
      setIsError(true);
      
      toast({
        title: 'Erro',
        description: `Falha ao carregar pacientes: ${(err as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user, filters, pagination, toast]);
  
  // Fetch on mount and when dependencies change
  useEffect(() => {
    if (user) {
      debouncedFetch(500);
    }
    
    return () => {
      clearFetchTimeout();
    };
  }, [user, debouncedFetch, clearFetchTimeout]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1, offset: 0 })); // Reset to first page
    debouncedFetch(300); 
  }, [debouncedFetch]);
  
  // Handle status filter change specifically
  const handleStatusChange = useCallback((status: 'active' | 'archived' | 'all') => {
    handleFilterChange({ status });
  }, [handleFilterChange]);
  
  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    const offset = (page - 1) * pagination.pageSize;
    setPagination(prev => ({ 
      ...prev, 
      page,
      offset,
      limit: prev.pageSize
    }));
    debouncedFetch(100);
  }, [pagination.pageSize, debouncedFetch]);
  
  // Toggle patient status between active/archived
  const togglePatientStatus = useCallback(async (patientId: string, newStatus: 'active' | 'archived') => {
    if (!user) return;
    
    try {
      // Since status might not be in the database yet, we're using a placeholder
      // Replace this with actual database update when the field is added
      const { error } = await supabase
        .from('patients')
        .update({ /* status: newStatus */ })
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
      debouncedFetch(500);
    } catch (err) {
      console.error('Error updating patient status:', err);
      
      toast({
        title: 'Error',
        description: `Failed to update patient status: ${(err as Error).message}`,
        variant: 'destructive',
      });
    }
  }, [user, toast, debouncedFetch]);
  
  const refetch = useCallback(() => {
    fetchPatients();
  }, [fetchPatients]);
  
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
