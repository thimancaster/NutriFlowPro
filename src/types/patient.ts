import { User } from "./auth";

export interface Patient {
  id: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'archived';
  photo_url?: string;
  user?: User;
}

export interface PatientFilters {
  status?: 'active' | 'inactive' | 'archived' | '';
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
