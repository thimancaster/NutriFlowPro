
export interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: any;
  identities: any[];
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  secondaryPhone?: string | null;
  birth_date?: string | null;
  gender?: 'M' | 'F' | null;
  cpf?: string | null;
  address?: any | null;
  status?: 'active' | 'archived';
  user_id: string;
  notes?: string | null;
  goals?: any | null;
}

export interface PatientFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface PaginationParams {
  limit: number;
  offset: number;
  page?: number;
  perPage?: number;
}

export interface ConsultationData {
  id: string;
  user_id: string;
  patient_id: string;
  patient: {
    id: string;
    name: string;
    gender: 'M' | 'F';
    age: number;
  };
  weight: number;
  height: number;
  objective: string;
  activityLevel: string;
  gender: string;
  created_at: string;
  tipo: string;
  results: {
    bmr: number;
    get: number;
    adjustment: number;
    vet: number;
    macros: {
      carbs: number;
      protein: number;
      fat: number;
      proteinPerKg: number;
    };
  };
  [key: string]: any;
}

// Re-export from other type files
export * from './appointment';
export * from './meal';
