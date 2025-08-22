
export interface Consultation {
  id: string;
  patient_id: string;
  calculation_id?: string;
  meal_plan_id?: string;
  date: string;
  metrics: {
    weight: number;
    height?: number;
    bmi?: number;
    objective?: string;
    [key: string]: any;
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationCreateInput {
  patient_id: string;
  calculation_id?: string;
  meal_plan_id?: string;
  date?: string;
  metrics: {
    weight: number;
    height?: number;
    bmi?: number;
    objective?: string;
    [key: string]: any;
  };
  notes?: string;
}

export interface ConsultationUpdateInput {
  calculation_id?: string;
  meal_plan_id?: string;
  date?: string;
  metrics?: {
    weight?: number;
    height?: number;
    bmi?: number;
    objective?: string;
    [key: string]: any;
  };
  notes?: string;
}
