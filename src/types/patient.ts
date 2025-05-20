
import { Json } from '@/integrations/supabase/types';

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  birth_date?: string;
  gender?: string;
  address?: AddressDetails | string;
  cpf?: string;
  goals?: {
    objective?: string;
    profile?: string;
    targetWeight?: number;
    initialWeight?: number;
  };
  measurements?: {
    weight?: number;
    height?: number;
    body_fat?: number;
    muscle_mass?: number;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  status: 'active' | 'archived';
  last_appointment?: string;
  next_appointment?: string;
  // Computed properties
  age?: number;
  weight?: number;
  height?: number;
}

export interface PatientOption {
  id: string;
  name: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  age?: number;
  measurements?: {
    weight?: number;
    height?: number;
    body_fat?: number;
    muscle_mass?: number;
  };
}

export interface PatientFilters {
  search: string;
  status: 'active' | 'archived' | 'all';
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AddressDetails {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}
