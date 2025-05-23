
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
  triceps?: number;
  subscapular?: number;
  suprailiac?: number;
  abdominal?: number;
  thigh?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  arm?: number;
  calf?: number;
  lean_mass_kg?: number;
  rcq?: number;
}

export interface PatientGoals {
  objective?: string;
  profile?: string;
  targetWeight?: number;
  initialWeight?: number;
}

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
  goals?: PatientGoals;
  measurements?: PatientMeasurements;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  status: 'active' | 'archived';
  last_appointment?: string;
  next_appointment?: string;
  // Computed properties
  age?: number;
  weight?: number;
  height?: number;
}

export interface PatientOption {
  id: string;
  name: string;
  email?: string;
  birth_date?: string;
  gender?: string;
  age?: number;
  measurements?: PatientMeasurements;
}

export interface PatientFilters {
  search: string;
  status: 'active' | 'archived' | 'all';
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
