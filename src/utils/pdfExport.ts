
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Extend the jsPDF type definition to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface MealPlanExportOptions {
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

const generateMealPlanPDF = (options: MealPlanExportOptions): jsPDF => {
  const {
    patientName,
    patientAge,
    patientGender,
    nutritionistName = 'Nutricionista',
    clinicName = 'NutriVita',
    clinicLogo,
    date = new Date(),
    meals,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFats,
    notes
  } = options;
  
  // Initialize PDF document (A4 format)
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add background color on top
  doc.setFillColor(240, 249, 245); // Light green background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add title
  doc.setTextColor(0, 100, 80); // Green text color
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PLANO ALIMENTAR', pageWidth / 2, 20, { align: 'center' });
  
  // Add clinic name and date
  doc.setTextColor(100, 100, 100); // Gray text color
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(clinicName, 20, 35);
  doc.text(`Data: ${format(date, 'dd/MM/yyyy')}`, pageWidth - 20, 35, { align: 'right' });
  
  // Add patient info
  doc.setTextColor(60, 60, 60); // Darker gray
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO PACIENTE', 20, 55);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${patientName}`, 20, 65);
  
  let patientInfoLine = '';
  if (patientAge) patientInfoLine += `Idade: ${patientAge} anos`;
  if (patientGender) patientInfoLine += patientInfoLine ? ` | Sexo: ${patientGender === 'male' ? 'Masculino' : 'Feminino'}` : `Sexo: ${patientGender === 'male' ? 'Masculino' : 'Feminino'}`;
  
  if (patientInfoLine) {
    doc.text(patientInfoLine, 20, 75);
  }
  
  // Add nutritional summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMO NUTRICIONAL', 20, 95);
  
  const summaryData = [
    ['Calorias Totais', 'Proteínas', 'Carboidratos', 'Gorduras'],
    [`${totalCalories} kcal`, `${totalProtein}g`, `${totalCarbs}g`, `${totalFats}g`]
  ];
  
  doc.autoTable({
    startY: 100,
    head: [summaryData[0]],
    body: [summaryData[1]],
    theme: 'grid',
    headStyles: {
      fillColor: [0, 128, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      halign: 'center'
    }
  });
  
  // Add meal plan table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  let currentY = (doc as any).lastAutoTable.finalY + 20;
  doc.text('PLANO ALIMENTAR', 20, currentY);
  currentY += 10;
  
  // For each meal, add a table
  meals.forEach((meal, index) => {
    // Check if we need a new page
    if (currentY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      currentY = 20;
    }
    
    // Add meal header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 80); // Green text color
    doc.text(`${meal.name} (${meal.percent}%) - ${meal.calories} kcal`, 20, currentY);
    currentY += 5;
    
    // Create meal macros table
    const mealMacros = [
      ['Proteínas', 'Carboidratos', 'Gorduras'],
      [`${meal.protein}g`, `${meal.carbs}g`, `${meal.fat}g`]
    ];
    
    doc.autoTable({
      startY: currentY,
      head: [mealMacros[0]],
      body: [mealMacros[1]],
      theme: 'grid',
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [230, 237, 244],
        textColor: [60, 60, 60],
        fontStyle: 'bold'
      },
      margin: { left: 20 }
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 5;
    
    // Add food suggestions
    if (meal.suggestions && meal.suggestions.length > 0) {
      const suggestionRows = meal.suggestions.map((suggestion: string) => [suggestion]);
      
      doc.autoTable({
        startY: currentY,
        head: [['Sugestões de Alimentos']],
        body: suggestionRows,
        theme: 'grid',
        styles: {
          fontSize: 10
        },
        headStyles: {
          fillColor: [240, 249, 245],
          textColor: [0, 100, 80],
          fontStyle: 'bold'
        },
        margin: { left: 20 }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      currentY += 10;
    }
  });
  
  // Add notes if provided
  if (notes) {
    if (currentY > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('OBSERVAÇÕES', 20, currentY);
    currentY += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(notes, pageWidth - 40);
    doc.text(splitNotes, 20, currentY);
  }
  
  // Add nutritionist signature at the bottom
  const bottomY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(0, 100, 80); // Green line color
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 50, bottomY, pageWidth / 2 + 50, bottomY);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 100, 80);
  doc.text(nutritionistName, pageWidth / 2, bottomY + 10, { align: 'center' });
  
  return doc;
};

export { generateMealPlanPDF };
