import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
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
  patientGender?: 'male' | 'female';
  meals: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    percent: number;
    suggestions: string[];
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  nutritionistName?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  date?: string;
  notes?: string;
}

export const generateMealPlanPDF = (options: MealPlanExportOptions): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Colors
  const primaryColor: [number, number, number] = [52, 168, 83]; // Verde NutriFlow
  const secondaryColor: [number, number, number] = [33, 150, 243]; // Azul
  const grayColor: [number, number, number] = [108, 117, 125];

  // Header with logo placeholder and title
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NutriFlow Pro', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Plano Alimentar Personalizado', margin, 35);

  yPosition = 55;

  // Date and professional info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const currentDate = options.date || new Date().toLocaleDateString('pt-BR');
  doc.text(`Data: ${currentDate}`, pageWidth - margin - 60, yPosition);
  
  if (options.clinicName) {
    doc.text(options.clinicName, margin, yPosition);
  }
  
  yPosition += 15;

  // Patient Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Informações do Paciente', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  doc.text(`Nome: ${options.patientName}`, margin, yPosition);
  yPosition += 8;
  
  if (options.patientAge) {
    doc.text(`Idade: ${options.patientAge} anos`, margin, yPosition);
    yPosition += 8;
  }
  
  if (options.patientGender) {
    const gender = options.patientGender === 'male' ? 'Masculino' : 'Feminino';
    doc.text(`Sexo: ${gender}`, margin, yPosition);
    yPosition += 8;
  }

  yPosition += 10;

  // Macronutrient Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Resumo Nutricional Diário', margin, yPosition);
  
  yPosition += 15;

  // Macros table
  const macroData = [
    ['Nutriente', 'Quantidade', 'Calorias', '% do Total'],
    [
      'Proteínas', 
      `${Math.round(options.totalProtein)}g`, 
      `${Math.round(options.totalProtein * 4)} kcal`, 
      `${Math.round((options.totalProtein * 4 * 100) / options.totalCalories)}%`
    ],
    [
      'Carboidratos', 
      `${Math.round(options.totalCarbs)}g`, 
      `${Math.round(options.totalCarbs * 4)} kcal`, 
      `${Math.round((options.totalCarbs * 4 * 100) / options.totalCalories)}%`
    ],
    [
      'Gorduras', 
      `${Math.round(options.totalFats)}g`, 
      `${Math.round(options.totalFats * 9)} kcal`, 
      `${Math.round((options.totalFats * 9 * 100) / options.totalCalories)}%`
    ],
    ['Total', '', `${Math.round(options.totalCalories)} kcal`, '100%']
  ];

  doc.autoTable({
    head: [macroData[0]],
    body: macroData.slice(1),
    startY: yPosition,
    headStyles: { 
      fillColor: primaryColor, 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    margin: { left: margin, right: margin }
  });

  yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : yPosition + 80;

  // Meals Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Distribuição das Refeições', margin, yPosition);
  
  yPosition += 15;

  options.meals.forEach((meal, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Meal header
    doc.setFillColor(...secondaryColor);
    doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${meal.name} (${Math.round(meal.calories)} kcal - ${meal.percent}%)`, margin + 5, yPosition + 3);
    
    yPosition += 20;

    // Meal macros
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const mealMacros = `Proteínas: ${Math.round(meal.protein)}g | Carboidratos: ${Math.round(meal.carbs)}g | Gorduras: ${Math.round(meal.fat)}g`;
    doc.text(mealMacros, margin + 5, yPosition);
    
    yPosition += 12;

    // Food suggestions
    if (meal.suggestions && meal.suggestions.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Sugestões de alimentos:', margin + 5, yPosition);
      
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      meal.suggestions.forEach((suggestion, suggestionIndex) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(`• ${suggestion}`, margin + 10, yPosition);
        yPosition += 6;
      });
    }

    yPosition += 10;
  });

  // Notes section
  if (options.notes) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Observações:', margin, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const splitNotes = doc.splitTextToSize(options.notes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, yPosition);
    yPosition += splitNotes.length * 5;
  }

  // Footer with recommendations
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }

  yPosition = pageHeight - 50;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...grayColor);
  
  const footerText = [
    'Este plano alimentar é apenas uma sugestão e deve ser adaptado às necessidades individuais.',
    'Consulte sempre um nutricionista para orientações personalizadas.',
    'Beba pelo menos 2 litros de água por dia e pratique atividade física regularmente.'
  ];
  
  footerText.forEach((text, index) => {
    doc.text(text, margin, yPosition + (index * 6));
  });

  // Professional signature area
  if (options.nutritionistName || options.clinicName) {
    yPosition = pageHeight - 25;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    if (options.nutritionistName) {
      doc.text(`Nutricionista: ${options.nutritionistName}`, margin, yPosition);
    }
    
    if (options.clinicPhone) {
      doc.text(`Contato: ${options.clinicPhone}`, pageWidth - margin - 80, yPosition);
    }
  }

  return doc;
};