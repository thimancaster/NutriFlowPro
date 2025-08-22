
// Re-export all types from individual modules
export * from './patient';
export * from './mealPlanTypes';

// Additional types that are commonly used across the application
export interface AddressDetails {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface PatientFilters {
  search?: string;
  status?: 'active' | 'archived' | '';
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PatientResponse {
  success: boolean;
  data?: any;
  error?: string;
}
