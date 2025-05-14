
// Add ConsultationData type

export interface ConsultationData {
  id: string;
  user_id: string;
  patient_id: string;
  date: Date;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activity_level: string;
  objective: string;
  consultation_type: string;
  bmr: number;
  vet: number;
  carbs_percentage: number;
  protein_percentage: number;
  fat_percentage: number;
  patient?: { 
    name: string;
    age?: number;
  };
  results: {
    get: number;
    adjustment: number;
    vet: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPerKg?: number;
    }
  };
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_date?: string; // Changed from Date to string to match database
  age?: number;
  weight?: number;
  height?: number;
  created_at?: string; // Changed from Date to string
  updated_at?: string; // Changed from Date to string
  address?: any; // Changed from string to any to support object properties
  notes?: string;
  user_id?: string;
  status?: 'active' | 'archived';
  goals?: {
    objective?: string;
    profile?: string;
    weight?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  secondaryPhone?: string;
  cpf?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
  offset?: number; // Added missing property
}

export interface PatientFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string; // Added missing property
  endDate?: string; // Added missing property
  page?: number; // Added missing property
  pageSize?: number; // Added missing property
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

// Forward export the MealDistributionItem and related types
export * from './meal';
export * from './appointment';
