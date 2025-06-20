
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MealPlanExportOptions } from './types';
import { addPdfHeader } from './pdfHeader';
import { addPatientSection } from './patientSection';
import { addNutritionalSummary } from './nutritionalSummary';
import { addMealsSection } from './mealsSection';
import { addNotesSection } from './notesSection';
import { addFooterSection } from './footerSection';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export const generateMealPlanPDF = (options: MealPlanExportOptions): jsPDF => {
  // Initialize PDF document (A4 format)
  const doc = new jsPDF();
  
  // Add different sections to the PDF
  addPdfHeader(doc, options);
  addPatientSection(doc, options);
  addNutritionalSummary(doc, options);
  
  // Add meals and get the current Y position
  const mealsEndY = addMealsSection(doc, options);
  
  // Add notes section and get updated Y position
  addNotesSection(doc, options, mealsEndY);
  
  // Add the footer with nutritionist signature
  addFooterSection(doc, options);
  
  return doc;
};
