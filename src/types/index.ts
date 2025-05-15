export * from './appointment';
export * from './meal';
export * from './patient';

export interface ConsultationData {
  id?: string;
  user_id?: string;
  weight: number;
  height: number;
  age?: number;
  bmr: number;
  tdee: number;
  protein: number;
  carbs: number;
  fats: number;
  gender: string;
  activity_level: string;
  goal?: string;
  objective?: string;
  notes?: string;
  patient?: {
    name: string;
    age?: number;
  };
  results: {
    bmr: number;
    get: number;
    vet: number;
    adjustment: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    }
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  limit?: number;
  offset?: number;
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
