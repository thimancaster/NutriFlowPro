
import { jsPDF } from 'jspdf';

// Extend the jsPDF type definition to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export interface MealPlanExportOptions {
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  nutritionistName?: string;
  clinicName?: string;
  clinicLogo?: string;
  date?: Date;
  meals: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  notes?: string;
}
