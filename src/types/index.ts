
// Add ConsultationData type

export interface ConsultationData {
  id: string;
  user_id: string;
  patient_id: string;
  date: Date;
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  activity_level: string;
  objective: string;
  consultation_type: string;
  bmr: number;
  vet: number;
  carbs_percentage: number;
  protein_percentage: number;
  fat_percentage: number;
  patient: { name: string };
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  birth_date?: Date;
  age?: number;
  weight?: number;
  height?: number;
  created_at?: Date;
  updated_at?: Date;
  address?: string;
  notes?: string;
  user_id?: string;
}
