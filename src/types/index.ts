
export * from './appointment';
export * from './meal';
export * from './patient';
export * from './consultation';

export interface ConsultationData {
  id: string;
  user_id?: string;
  patient_id: string;
  date?: string;
  appointment_id?: string;
  
  // Anthropometry data
  anthropometry?: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityFactor: number;
    bodyFat: number | null;
  };
  
  // Nutritional objectives
  nutritionalObjectives?: {
    objective: string;
    customCalories: number | null;
  };
  
  // Macro distribution
  macroDistribution?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  
  // Original properties
  weight: number;
  height: number;
  age?: number;
  bmr: number;
  tdee?: number;
  protein: number;
  carbs: number;
  fats: number;
  gender: string;
  activity_level: string;
  goal?: string;
  objective?: string;
  notes?: string;
  recommendations?: string;
  
  patient?: {
    name: string;
    age?: number;
    id?: string;
  };
  
  results: {
    bmr: number;
    get: number;
    vet: number;
    tdee?: number;
    adjustment: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPerKg?: number;
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
  sortDirection?: 'asc' | 'desc'; 
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}
