export interface Address {
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
}

export interface Patient {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  birth_date?: string; // For backward compatibility
  gender?: string;
  weight?: number;
  height?: number;
  address?: Address;
  goals?: {
    primary?: string;
    secondary?: string;
  };
  status?: 'active' | 'archived';
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultationData {
  id?: string;
  patient_id?: string;
  user_id?: string;
  date?: string;
  type?: string;
  consultationType?: string;
  notes?: string;
  objective?: string;
  age?: number;
  results?: {
    get: number;  // GET (Gasto Energético Total)
    gbm?: number; // Gasto Basal Metabólico
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

export interface MealPlan {
  id?: string;
  name: string;
  patient_id: string;
  consultation_id?: string;
  calories: number;
  totalCalories?: number; // For backward compatibility
  protein: number;
  totalProtein?: number; // For backward compatibility
  carbs: number;
  totalCarbs?: number; // For backward compatibility
  fat: number;
  totalFat?: number; // For backward compatibility
  total_calories?: number; // For backward compatibility
  total_protein?: number; // For backward compatibility
  total_carbs?: number; // For backward compatibility
  total_fats?: number; // For backward compatibility
  meals: any[];
  mealDistribution: any[];
  date?: string;
  created_at?: string;
  createdAt?: string; // For backward compatibility
}

// Extend the MealDistributionItem interface
export interface MealDistributionItem {
  id?: string;
  name: string;
  percent: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number; 
  time?: string;
  suggestions?: string[];
}

export * from './appointment';
