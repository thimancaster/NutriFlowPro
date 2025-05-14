// Patient type with all the necessary fields
export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  gender?: string;
  birth_date: Date;
  address?: string;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  cpf?: string;
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
  measurements?: Record<string, any>;
  // Computed properties
  age?: number;
  weight?: number;
  height?: number;
}

// Appointment interface
export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  patientName?: string;
  start_time: string | Date;
  end_time: string | Date;
  title?: string;
  notes?: string;
  status: string;
  appointment_type_id?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  date?: string | Date; // Added date property which exists in the database
  type?: string; // Added type property which exists in the database
}

export interface AppointmentFormData {
  patient_id: string;
  appointment_type_id?: string;
  title?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status?: string;
}

export type AppointmentType = {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  color?: string;
};

export type AppointmentStatus = 'scheduled' | 'completed' | 'canceled' | 'rescheduled';

// PatientFilters interface
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

// PaginationParams interface
export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  offset?: number;
  limit?: number;
}

// ConsultationData interface
export interface ConsultationData {
  patientId?: string;
  consultationId?: string;
  type?: string;
  date?: string;
  patient?: {
    id?: string;
    name: string;
    age?: number;
    gender?: string;
    weight?: number;
    height?: number;
  };
  results?: {
    bmr?: number;
    get: number;
    adjustment: number;
    vet: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPerKg?: number;
    };
  };
  notes?: string;
}
