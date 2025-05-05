
import { generateMealPlanPDF } from './pdf/pdfExport';
import { MealPlanExportOptions } from './pdf/types';
import { jsPDF } from 'jspdf';

/**
 * Generate PDF in a non-blocking way using setTimeout
 * @param options Options for PDF generation
 * @returns Promise that resolves with the generated PDF
 */
export const generatePdfAsync = (options: MealPlanExportOptions): Promise<jsPDF> => {
  return new Promise((resolve, reject) => {
    // Use setTimeout to avoid blocking the main thread
    setTimeout(() => {
      try {
        const doc = generateMealPlanPDF(options);
        resolve(doc);
      } catch (error) {
        reject(error);
      }
    }, 0);
  });
};

export { generateMealPlanPDF, type MealPlanExportOptions };
