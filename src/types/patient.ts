
export interface Patient {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_date: Date | string; // Support both Date object and string format
  age?: number;
  weight?: number;
  height?: number;
  created_at?: string;
  updated_at?: string;
  address?: string | any;
  notes?: string;
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
