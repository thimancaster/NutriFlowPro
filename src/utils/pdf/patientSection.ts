
import { jsPDF } from 'jspdf';
import { MealPlanExportOptions } from './types';

export const addPatientSection = (
  doc: jsPDF, 
  options: MealPlanExportOptions
): void => {
  const { patientName, patientAge, patientGender } = options;
  
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
};
