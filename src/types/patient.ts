
export interface PatientGoals {
  objective?: 'manutencao' | 'emagrecimento' | 'hipertrofia';
  profile?: 'eutrofico' | 'obeso_sobrepeso' | 'atleta';
  activityLevel?: 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo';
  target_weight?: number;
  notes?: string;
  customGoals?: string; // Add missing customGoals property
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  cpf?: string;
  birth_date: string;
  gender: 'male' | 'female' | 'other';
  address?: string | object; // Allow both string and object types
  notes?: string;
  status: 'active' | 'archived';
  goals?: PatientGoals;
  created_at: string;
  updated_at: string;
  user_id: string;
  age?: number;
  weight?: number;
  height?: number;
  last_appointment?: string; // Add missing last_appointment property
}
