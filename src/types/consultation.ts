
// Define the allowed profile types
export type Profile = 'magro' | 'normal' | 'sobrepeso' | 'obeso' | 'atleta' | 'eutrofico' | 'sobrepeso_obesidade';

// Re-export other types that might be in this file
export interface ConsultationData {
  id: string;
  patient_id: string;
  user_id: string;
  date: string | Date;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activity_level?: string;
  objective?: string;
  consultation_type?: string;
  bmr?: number;
  vet?: number;
  carbs_percentage?: number;
  protein_percentage?: number;
  fat_percentage?: number;
  patient?: {
    name: string;
    [key: string]: any;
  };
  results?: any;
  // Add other fields as needed
}
