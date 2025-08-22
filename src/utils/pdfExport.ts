
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface MealPlanExportOptions {
  patientName: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    percent: number;
    suggestions: string[];
  }[];
}

export const generateMealPlanPDF = (options: MealPlanExportOptions) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Plano Alimentar', 20, 30);
  
  // Add patient info
  doc.setFontSize(12);
  doc.text(`Paciente: ${options.patientName}`, 20, 50);
  doc.text(`Calorias totais: ${options.totalCalories} kcal`, 20, 60);
  doc.text(`Proteínas: ${options.totalProtein}g`, 20, 70);
  doc.text(`Carboidratos: ${options.totalCarbs}g`, 20, 80);
  doc.text(`Gorduras: ${options.totalFats}g`, 20, 90);
  
  // Add meals table
  const tableData = options.meals.map(meal => [
    meal.name,
    `${meal.calories} kcal`,
    `${meal.protein}g`,
    `${meal.carbs}g`,
    `${meal.fat}g`,
    `${meal.percent}%`
  ]);
  
  (doc as any).autoTable({
    head: [['Refeição', 'Calorias', 'Proteínas', 'Carboidratos', 'Gorduras', 'Percentual']],
    body: tableData,
    startY: 100,
  });
  
  return doc;
};
