export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  birthDate?: Date;
  sex: string;
  address?: Address;
  objective: string;
  notes?: string;
  profile: string;
  cpf: string;
  archived_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  user_id: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface PaginationParams {
  page: number;
  perPage: number;
}

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

export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  patientId: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  mealDistribution: MealDistributionItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
}

export interface MealDistributionItem {
  id: string;
  name: string;
  percentage: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  order: number;
  mealPlanId: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface MealItem {
  id: string;
  foodId: string;
  quantity: number;
  unit: string;
  mealId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  food?: Food;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ConsultationData {
  id: string;
  patientId: string;
  userId: string;
  date: Date;
  weight: number;
  height: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
  waterPercentage: number;
  metabolicAge: number;
  visceralFat: number;
  dailyCaloricNeeds: number;
  macronutrientDistribution: MacronutrientDistribution;
  mealDistribution: MealDistributionItem[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MacronutrientDistribution {
  protein: number;
  carbs: number;
  fat: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: any;
  user: any;
  login: (email: string, password?: string, remember?: boolean) => Promise<any>;
  signup: (email: string, password?: string, name?: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: any;
  user: any;
}
