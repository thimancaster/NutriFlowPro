
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export interface PatientOption {
  id: string;
  name: string;
  email?: string;
  birth_date?: string;
  age?: number;
}

export const usePatientOptions = (searchQuery?: string) => {
  const { user } = useAuth();
  const debouncedSearch = useDebounce(searchQuery || '', 300);

  return useQuery({
    queryKey: ['patient-options', user?.id, debouncedSearch],
    queryFn: async (): Promise<PatientOption[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('patients')
        .select('id, name, email, birth_date')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Apply search filter if provided
      if (debouncedSearch && debouncedSearch.trim()) {
        query = query.or(`name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        throw error;
      }

      return (data || []).map(patient => ({
        id: patient.id,
        name: patient.name,
        email: patient.email || undefined,
        birth_date: patient.birth_date || undefined,
        age: patient.birth_date ? calculateAge(patient.birth_date) : undefined
      }));
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds - shorter cache for search results
  });
};

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
