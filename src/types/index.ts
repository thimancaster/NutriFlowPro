
// Re-export all types from individual modules
export * from './patient';
export * from './mealPlanTypes';
export * from './consultation';
export * from './appointment';
export * from './appointments';
export * from './meal';

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

// Re-export commonly used types with aliases for backward compatibility
export type { ConsultationData } from './consultation';
export type { Appointment, AppointmentStatus } from './appointment';
export type { AppointmentType, EnhancedAppointment } from './appointments';
export type { MealDistributionItem, MealAssemblyFood } from './meal';
