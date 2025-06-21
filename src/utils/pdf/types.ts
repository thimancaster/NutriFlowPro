
import { jsPDF } from 'jspdf';

export interface MealPlanExportOptions {
  meals: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    percent: number;
    suggestions?: string[];
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  clinicName?: string;
  nutritionistName?: string;
  date?: Date;
  notes?: string;
  settings?: {
    patientName?: string;
    patientData?: any;
    patientAge?: number;
    patientGender?: string;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'header' | 'patient-info' | 'nutritional-summary' | 'meals' | 'notes' | 'footer';
  enabled: boolean;
  options?: Record<string, any>;
}
