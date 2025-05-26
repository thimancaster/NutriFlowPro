
import { User } from "./auth";

export interface AddressDetails {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface PatientMeasurements {
  weight?: number;
  height?: number;
  body_fat?: number;
  muscle_mass?: number;
  imc?: number;
}

export interface PatientGoals {
  objective?: string;
  profile?: string;
  targetWeight?: number;
  initialWeight?: number;
}

export interface Patient {
  id: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  cpf?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string | AddressDetails;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  status?: 'active' | 'archived';
  photo_url?: string;
  user?: User;
  measurements?: PatientMeasurements;
  goals?: PatientGoals;
  last_appointment?: string;
  age?: number;
}

export interface PatientFilters {
  status?: 'active' | 'archived' | '';
  search?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PatientListResponse {
  patients: Patient[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface PatientOption {
  id: string;
  name: string;
  email?: string;
  age?: number;
  birth_date?: string;
  gender?: string;
  measurements?: PatientMeasurements;
}

export interface PatientResponse {
  success: boolean;
  data?: Patient;
  error?: string;
}
