
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
  };
  measurements?: {
    weight?: number;
    height?: number;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  status?: 'active' | 'archived';
  // Computed properties
  age?: number;
  weight?: number;
  height?: number;
}

export interface PatientFilters {
  search: string;
  status: 'active' | 'archived' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
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
