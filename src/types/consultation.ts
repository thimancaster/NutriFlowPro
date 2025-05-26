
export interface ConsultationData {
  id?: string;
  patient_id?: string;
  patient?: any;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  activity_level?: string;
  objective?: string;
  bmr?: number;
  tdee?: number;
  totalCalories: number; // Add this property
  protein: number;
  carbs: number;
  fats: number;
  created_at?: string;
  updated_at?: string;
}
